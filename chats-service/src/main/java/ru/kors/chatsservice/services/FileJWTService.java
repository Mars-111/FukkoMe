package ru.kors.chatsservice.services;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import ru.kors.chatsservice.exceptions.BadFileJWT;
import ru.kors.chatsservice.models.AccessFileJWT;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HexFormat;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileJWTService {

    @Value("${file-service.release.jwt.secret}")
    private String secretKeyString;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (secretKeyString == null || secretKeyString.isEmpty()) {
            log.error("JWT secret key is not set or empty. Please check your configuration.");
            throw new IllegalStateException("JWT secret key is not set or empty.");
        }
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
        log.info("secretKey: alg=" + this.secretKey.getAlgorithm() + " format=" + this.secretKey.getFormat() +
                " encoded=" + HexFormat.of().formatHex(this.secretKey.getEncoded()));
        if (secretKey == null || secretKey.getEncoded().length == 0) {
            log.error("JWT secret key is not set. Please check your configuration.");
        }
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

    public Claims verifyUserCreatedAndGetClaims(String token, Long userCreator) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.warn("Invalid or expired token: {}", e.getMessage() + "\ntoken: " + token);
            return null;
        }
        if (!claims.get("userId", Long.class).equals(userCreator)) {
            log.warn("Current user not equals user created of token. {} != {}", userCreator, claims.get("user_created", Long.class));
            return null;
        }
        return claims;
    }



}

