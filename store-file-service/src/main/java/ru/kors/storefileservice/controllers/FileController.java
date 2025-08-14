package ru.kors.storefileservice.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import ru.kors.storefileservice.exceptions.NotAccessToFileException;
import ru.kors.storefileservice.models.DecodeTokenResult;
import ru.kors.storefileservice.services.CurrentUserUtil;
import ru.kors.storefileservice.services.FileService;
import ru.kors.storefileservice.services.FileAccessTokenService;
import software.amazon.awssdk.services.s3.S3AsyncClient;

import java.time.Duration;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final S3AsyncClient s3AsyncClient;
    private final FileService fileService;
    private final CurrentUserUtil currentUserUtil;
    private final FileAccessTokenService fileAccessTokenService;

    @Value("${s3.bucket}")
    private String bucket;

    @PostMapping("/upload")
    public Mono<ResponseEntity<String>> uploadMultiple(@RequestPart("file") Mono<FilePart> file,
                                                       @RequestParam("size") Long fileSize,
                                                       @RequestParam("isPrivate") boolean isPrivate) {
        System.out.println("call /upload");
        return file.flatMap(filePart -> fileService.upload(filePart, fileSize, isPrivate))
                .map(uploadResult ->
                        fileAccessTokenService.generateFileTokenForCreate(
                                uploadResult.getMedia().getId(),
                                uploadResult.getMedia().getOwnerId(),
                                uploadResult.getMedia().getExtension(),
                                uploadResult.getMedia().getFilename(),
                                uploadResult.getImageMetadata(),
                                fileSize,
                                isPrivate))
                .map(ResponseEntity::ok);
    }

    @GetMapping("/{fileId}")
    public Mono<ResponseEntity<?>> download(@PathVariable Long fileId,
                                            @RequestHeader(value = "AccessFileToken", required = false) String accessFileToken) {
        System.out.println("call /{fileId}");
        System.out.println("accessFileToken = " + accessFileToken);
        if (accessFileToken != null && !accessFileToken.isEmpty()) {
            DecodeTokenResult decoded = fileAccessTokenService.decode(accessFileToken);

            return currentUserUtil.getCurrentUserId()
                    .handle((currentUserId, sink) -> {
                        if (!currentUserId.equals(decoded.userId())) {
                            sink.error(new NotAccessToFileException("Token userId is not equal to current userId"));
                            return;
                        }
                        if (!decoded.allowedMediaIds().contains(fileId)) {
                            sink.error(new NotAccessToFileException("Not access to file"));
                            return;
                        }
                        sink.complete();
                    })
                    .flatMap(userId -> fileService.findById(fileId))
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found")))
                    .flatMap(file ->
                            fileService.getOneTimeLink(file.getKey(), Duration.ofSeconds(90))
                                    .map(url -> ResponseEntity.ok(file.toFileViewDTO(url)))
                    );
        }
        else {
            return fileService.findById(fileId)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found")))
                    .mapNotNull(file -> {
                        if (file.isPrivate()) {
                            return null;
                        }
                        return file;
                    })
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "This file is private!")))
                    .flatMap(file ->
                            fileService.getOneTimeLink(file.getKey(), Duration.ofSeconds(90))
                                    .map(url -> ResponseEntity.ok(file.toFileViewDTO(url)))
                    );
        }
    }




//
//    @GetMapping("/download/{key}")
//    public ResponseEntity<byte[]> download(@PathVariable String key) {
//
//        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
//                .bucket(bucket)
//                .key(key)
//                .build();
//
//        try (ResponseInputStream<GetObjectResponse> response = s3Client.getObject(getObjectRequest)) {
//            byte[] bytes = response.readAllBytes();
//
//            String contentType = response.response().contentType();
//            long contentLength = response.response().contentLength();
//
//            return ResponseEntity.ok()
//                    .contentType(MediaType.parseMediaType(contentType))
//                    .contentLength(contentLength)
//                    .body(bytes);
//
//        } catch (IOException e) {
//            return ResponseEntity.status(500).body(("Download failed: " + e.getMessage()).getBytes());
//        }
//    }
}
