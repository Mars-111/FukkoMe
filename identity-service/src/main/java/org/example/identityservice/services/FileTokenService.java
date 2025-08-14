package org.example.identityservice.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Slf4j
@Service
public class FileTokenService {

    @Value("${file-service.jwt.secret}")
    private String secretString;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (secretString == null || secretString.isEmpty()) {
            log.error("JWT secret key is not set or empty. Please check your configuration.");
            throw new IllegalStateException("JWT secret key is not set or empty.");
        }
        this.secretKey = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
        log.info("secretKey: alg=" + this.secretKey.getAlgorithm() + " format=" + this.secretKey.getFormat() +
                " encoded=" + HexFormat.of().formatHex(this.secretKey.getEncoded()));
        if (secretKey == null || secretKey.getEncoded().length == 0) {
            log.error("JWT secret key is not set. Please check your configuration.");
        }
    }

    public boolean verifyCreatedFileToken(String token) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    public boolean verifyCreatedFileToken(String token, Long userCreated) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return false;
        }
        return claims.get("userId", Long.class).equals(userCreated);
    }

    public Long verifyUserCreatedAndGetFileIdByCreatedFileToken(String token, Long userCreater) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.warn("Invalid or expired token: {}", e.getMessage());
            return null;
        }
        if (!claims.get("userId", Long.class).equals(userCreater)) {
            log.warn("Current user not equals user created of token. {} != {}", userCreater, claims.get("user_created", Long.class));
            return null;
        }
        return claims.get("fileId", Long.class);
    }
}
