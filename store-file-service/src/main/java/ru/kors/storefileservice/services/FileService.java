package ru.kors.storefileservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.resource.NoResourceFoundException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ru.kors.storefileservice.exceptions.BadRequestException;
import ru.kors.storefileservice.exceptions.S3InternalErrorException;
import ru.kors.storefileservice.models.File;
import ru.kors.storefileservice.models.UploadResult;
import ru.kors.storefileservice.repository.FileRepository;
import ru.kors.storefileservice.services.dto.FileIsPrivateAndKey;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;


import java.nio.ByteBuffer;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    @Value("${s3.bucket}")
    private String bucket;

    private final S3AsyncClient s3AsyncClient;
    private final FileRepository fileRepository;
    private final CurrentUserUtil currentUserUtil;
    private final S3Presigner s3Presigner;

    int HEAD_LIMIT = 256 * 1024;



    public Mono<UploadResult> upload(FilePart filePart, Long contentLength, boolean isPrivate) {
        if (contentLength == null || contentLength <= 0 || contentLength > 999999999) {
            throw new BadRequestException("Length must be greater than 0 or less than 999999999");
        }

        String key = UUID.randomUUID() + "-" + filePart.filename();


        int extensionIndex = filePart.filename().lastIndexOf(".");
        String extension = filePart.filename().substring(extensionIndex+1);
        String filename = filePart.filename().substring(0, extensionIndex);

        log.info("File extension: {}", extension);

        DataFileUtil dataFileUtil = new DataFileUtil(filePart.content(), extension, Math.toIntExact(contentLength));

        Flux<ByteBuffer> byteBufferFlux = dataFileUtil.getByteBufferFlux();
        if (byteBufferFlux == null) {
            throw new BadRequestException("Failed to process file content");
        }


        AsyncRequestBody requestBody = AsyncRequestBody.fromPublisher(byteBufferFlux);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(extension)
                .contentLength(contentLength)
                .build();

        return Mono.fromFuture(() -> s3AsyncClient.putObject(request, requestBody))
                .handle((resp, sink) -> {
                    if (resp.sdkHttpResponse().isSuccessful()) {
                        log.info("Successfully uploaded to S3: {}", resp.sdkHttpResponse().statusCode());
                        sink.next(resp);
                    } else {
                        log.error("Failed to upload to S3: {}", resp.sdkHttpResponse().statusCode());
                        sink.error(new S3InternalErrorException("Failed to upload to S3: " + resp.sdkHttpResponse().statusCode()));
                    }
                    log.info("111111111111");
                })
                .then(currentUserUtil.getCurrentUserId())
                .flatMap(userId -> {
                    File file = File.builder().ownerId(userId).key(key).extension(extension).size(contentLength).filename(filename).status("pending").isPrivate(isPrivate).createdAt(Instant.now()).build();
                    log.info("222222222222");
                    return fileRepository.save(file);
                })
                .map(file -> {
                    log.info("333333333333");
                    return new UploadResult(file, dataFileUtil.getFileMetadata());

                });
    }


    public Mono<String> findKeyById(Long id) {
        return fileRepository.findKeyById(id);
    }

    public Mono<Boolean> fileIsPublic(Long id) {
        return fileRepository.findIsPrivateById(id)
                .map(isPrivate -> !isPrivate);
    }

    public Mono<FileIsPrivateAndKey> findIsPrivateAndKeyById(Long id) {
        return fileRepository.findIsPrivateAndKeyById(id);
    }

    public Mono<String> getOneTimeLink(String key, Duration duration) {


        // Создаём pre-signed ссылку
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(60))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        if (presignedRequest == null) {
            throw new NoResourceFoundException("Not found resource");
        }

        return Mono.just(presignedRequest.url().toString());
    }

    public Mono<File> findById(Long fileId) {
        return fileRepository.findById(fileId);
    }
}
