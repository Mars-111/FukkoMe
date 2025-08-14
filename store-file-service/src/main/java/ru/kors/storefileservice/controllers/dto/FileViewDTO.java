package ru.kors.storefileservice.controllers.dto;

import java.time.Instant;

public record FileViewDTO(
        Long id,
        String extension,
        Long size,
        String filename,
        String S3Url,
        Instant createdAt
) {
}
