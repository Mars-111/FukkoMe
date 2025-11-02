package ru.kors.storefileservice.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import reactor.core.publisher.Flux;
import ru.kors.storefileservice.models.FileMetadata;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
public class DataFileUtil {

    private final Flux<DataBuffer> originalFlux;
    //private final String contentType;
    private final boolean hasDimensions;
    private final long expectedContentLength;
    private final AtomicBoolean metadataProcessedEnd = new AtomicBoolean(false);
    private int maxMetadataSize = 8192;
    private final ByteArrayOutputStream metadataBuffer = new ByteArrayOutputStream(maxMetadataSize);
    private FileMetadata fileMetadata;
    private String extension;
    private final Set<String> dimensionsExtensions = Set.of("png", "jpg", "jpeg", "gif", "webp");




    public DataFileUtil(Flux<DataBuffer> flux, String extension, int expectedContentLength) {
        this.originalFlux = flux;
        if (extension == null || extension.isBlank()) {
            throw new IllegalArgumentException("Content type must not be null or blank");
        }
        this.expectedContentLength = expectedContentLength;
        this.extension = extension;
        if (expectedContentLength < maxMetadataSize) {
            maxMetadataSize = expectedContentLength;
        }
        if (extensionIsDimensions(extension)) {
            log.info("extension is an image: {}", extension);
            this.hasDimensions = true;
        }
        else {
            this.hasDimensions = false;
        }
    }

    private boolean extensionIsDimensions(String extension) {
        return dimensionsExtensions.contains(extension);
    }

    public Flux<ByteBuffer> getByteBufferFlux() {
        return originalFlux
                .doOnNext(this::processMetadata)
                .map(dataBuffer -> {
                    try {
                        ByteBuffer byteBuffer = dataBuffer.asByteBuffer();
                        return byteBuffer;
                    } finally {
                        // КРИТИЧНО: Всегда освобождаем DataBuffer
                        DataBufferUtils.release(dataBuffer);
                    }
                })
                .timeout(Duration.ofMinutes(5))
                .onErrorMap(TimeoutException.class,
                        ex -> new RuntimeException("Превышено время ожидания загрузки файла"))
                .doOnError(error -> cleanup());
    }

    public FileMetadata getFileMetadata() {
        if (metadataProcessedEnd.get() && fileMetadata == null) {
            log.info("metadataBuffer.toByteArray(): {}", metadataBuffer.toByteArray());
            fileMetadata = MetadataParser.extractFileMetadata(metadataBuffer.toByteArray(), extension);
        }
        else if (!metadataProcessedEnd.get() || fileMetadata == null) {
            log.warn("Metadata processing is not complete or file metadata is not set");
            return null;
        }
        return fileMetadata;
    }

    public void cleanup() {
        metadataBuffer.reset();
        metadataProcessedEnd.set(false);
        fileMetadata = null;
    }


    private void processMetadata(DataBuffer dataBuffer) {
        if (metadataProcessedEnd.get() || !hasDimensions) {
            log.debug("Metadata processing already completed or not required, skipping");
            return;
        }


        int readable = Math.min(dataBuffer.readableByteCount(), maxMetadataSize);
        if (readable <= 0) {
            log.warn("No readable bytes in DataBuffer, skipping metadata processing");
            return;
        }
        byte[] bytes = new byte[readable];
        int currentPos = dataBuffer.readPosition();
        log.debug("Current position: {}", currentPos);

        dataBuffer.read(bytes, 0, readable);
        dataBuffer.readPosition(currentPos); //Восстановили позицию

        synchronized (metadataBuffer) {
            metadataBuffer.write(bytes, 0, readable);
            if (metadataBuffer.size() + readable > maxMetadataSize) {
                log.warn("Metadata buffer is full, skipping metadata processing");
                metadataProcessedEnd.set(true);
                return;
            }
        }
    }

}
