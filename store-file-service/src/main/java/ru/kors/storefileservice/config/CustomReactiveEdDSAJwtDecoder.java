package ru.kors.storefileservice.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.Ed25519Verifier;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetKeyPair;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


import java.util.List;

@Slf4j
public class CustomReactiveEdDSAJwtDecoder implements ReactiveJwtDecoder {

    private final OctetKeyPair cachedPublicKey;

    public CustomReactiveEdDSAJwtDecoder(String jwksUri) {
        WebClient webClient = WebClient.create();

        try {
            String jwkJson = webClient.get()
                    .uri(jwksUri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (jwkJson == null) {
                throw new JwtException("Failed to fetch JWKS JSON (null response)");
            }

            JWKSet jwkSet = JWKSet.parse(jwkJson);
            List<JWK> keys = jwkSet.getKeys();

            log.info("Fetched {} key(s) from JWKS", keys.size());
            for (JWK key : keys) {
                log.info("JWK key: kid={}, kty={}, alg={}, crv={}",
                        key.getKeyID(),
                        key.getKeyType(),
                        key.getAlgorithm() != null ? key.getAlgorithm().getName() : null,
                        key instanceof OctetKeyPair okp ? okp.getCurve() : null
                );
            }

            this.cachedPublicKey = keys.stream()
                    .filter(k -> k instanceof OctetKeyPair okp && "Ed25519".equals(okp.getCurve().getName()))
                    .map(k -> ((OctetKeyPair) k).toPublicJWK())
                    .findFirst()
                    .orElseThrow(() -> new JwtException("No valid Ed25519 key found in JWKS"));

        } catch (Exception e) {
            log.error("Failed to load JWKS: {}", e.getMessage(), e);
            throw new JwtException("JWKS loading failed", e);
        }
    }

    @Override
    public Mono<Jwt> decode(String token) {
        return Mono.fromCallable(() -> {
            System.out.println("x base64url = " + cachedPublicKey.getX());
            System.out.println("x byte length = " + cachedPublicKey.getX().decode().length);
            System.out.println("publicKey JSON = " + cachedPublicKey.toJSONString());
            System.out.println("crv = " + cachedPublicKey.getCurve()); // должно быть "Ed25519"
            System.out.println("crv.equals(Curve.Ed25519) = " + Curve.Ed25519.equals(cachedPublicKey.getCurve()));
            System.out.println("Token: " + token);

            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier;
            try {
                verifier = new Ed25519Verifier(cachedPublicKey);
            } catch (JOSEException e) {
                System.out.println("JOSEException");
                e.printStackTrace(); // важен stack trace!
                System.out.println("cachedPublicKey: " + cachedPublicKey.toJSONObject());
                throw new RuntimeException("Verifier creation failed", e);
            } catch (Exception e) {
                System.out.println("Exception");
                e.printStackTrace(); // важен stack trace!
                System.out.println("cachedPublicKey: " + cachedPublicKey.toJSONObject());
                throw new RuntimeException("Verifier creation failed", e);
            }


            if (!signedJWT.verify(verifier)) {
                throw new JwtException("JWT signature verification failed");
            }

            var claims = signedJWT.getJWTClaimsSet();

            return Jwt.withTokenValue(token)
                    .headers(h -> h.putAll(signedJWT.getHeader().toJSONObject()))
                    .claims(c -> c.putAll(claims.getClaims()))
                    .issuedAt(claims.getIssueTime() != null ? claims.getIssueTime().toInstant() : null)
                    .expiresAt(claims.getExpirationTime() != null ? claims.getExpirationTime().toInstant() : null)
                    .build();
        });
    }
}
