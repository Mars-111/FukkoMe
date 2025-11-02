package ru.kors.chatsservice.services;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import ru.kors.chatsservice.exceptions.BadFileJWT;
import ru.kors.chatsservice.models.AccessFileJWT;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FileJWTService {

    @Value("${file-service.release.jwt.secret}")
    private String secretKeyString;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }

    @Value("${file-service.release.jwt.issuer}")
    private String issuer;

    public String generateFileAccessToken(Set<Long> fileIds, Long userId, long expirationTimeInSeconds) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTimeInSeconds * 1000);

        return Jwts.builder()
                .subject("file_access")
                .claim("fileIds", fileIds)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .issuer(issuer)
                .signWith(secretKey)
                .compact();
    }

    public AccessFileJWT parseAccessUseCreatedFileJWT(String token) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new BadFileJWT("Invalid or expired token: " + e);
        }


        return new AccessFileJWT(   claims.get("fileId", Number.class).longValue(),
                                    claims.get("userId", Number.class).longValue(),
                                    claims.getSubject(),
                                    claims.get("filename", String.class),
                                    claims.get("extension", String.class),
                                    claims.get("size", Number.class).longValue(),
                                    claims.get("width", Number.class).intValue(),
                                    claims.get("height", Number.class).intValue()
        );
    }





}

