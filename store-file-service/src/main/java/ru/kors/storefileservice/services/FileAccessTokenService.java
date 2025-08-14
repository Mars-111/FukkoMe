package ru.kors.storefileservice.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.kors.storefileservice.exceptions.BadFileAccessJWTException;
import ru.kors.storefileservice.models.DecodeTokenResult;
import ru.kors.storefileservice.models.FileMetadata;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FileAccessTokenService {

    @Value("${file-service.jwt.secret}")
    private String secretKeyString;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }

    public DecodeTokenResult decode(String token) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new BadFileAccessJWTException("Invalid or expired token: " + e);
        }

        if (!claims.getSubject().equals("file_access")) {
            throw new BadFileAccessJWTException("Invalid token subject");
        }
        if (claims.get("userId") == null || claims.get("fileIds") == null) {
            throw new BadFileAccessJWTException("Missing userId or fileIds in token");
        }

        Long userId = claims.get("userId", Number.class).longValue();
        List<Number> fileIdsRaw = claims.get("fileIds", List.class);
        Set<Long> fileIds = fileIdsRaw.stream()
                .map(Number::longValue)
                .collect(Collectors.toSet());


        return new DecodeTokenResult(userId, fileIds);
    }

    public String generateFileTokenForCreate(Long fileId, Long userId, String extension, String filename, FileMetadata fileMetadata, Long fileSize, boolean privateFile) {
        String jwt = Jwts.builder()
                .subject("fileCreated")
                .issuer("file-service")
                .claim("userId", userId)
                .claim("fileId", fileId)
                .claim("size", fileSize)
                .claim("extension", extension)
                .claim("filename", filename)
                .claim("fileMetadata", fileMetadata)
                .claim("private", privateFile)
                .expiration(new Date(System.currentTimeMillis() + 360000)) // 360 seconds
                .signWith(secretKey)
                .compact();
        log.info("access file jwt: {}", jwt);
        return jwt;
    }

}
