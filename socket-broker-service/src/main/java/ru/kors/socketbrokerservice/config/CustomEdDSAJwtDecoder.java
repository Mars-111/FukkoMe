package ru.kors.socketbrokerservice.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.Ed25519Verifier;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetKeyPair;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.text.ParseException;
import java.util.List;

@Slf4j
@Component
public class CustomEdDSAJwtDecoder implements JwtDecoder {
    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwksUri;

    private OctetKeyPair cachedPublicKey;

    @PostConstruct
    public void init() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String jwkJson = restTemplate.getForObject(jwksUri, String.class);

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
                    .filter(k -> k instanceof OctetKeyPair okp && Curve.Ed25519.equals(okp.getCurve()))
                    .map(k -> ((OctetKeyPair) k).toPublicJWK())
                    .findFirst()
                    .orElseThrow(() -> new JwtException("No valid Ed25519 key found in JWKS"));

        } catch (Exception e) {
            log.error("Failed to load JWKS: {}", e.getMessage(), e);
            throw new JwtException("JWKS loading failed", e);
        }
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new Ed25519Verifier(cachedPublicKey);

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

        } catch (ParseException | JOSEException e) {
            throw new JwtException("Failed to decode or verify JWT", e);
        }
    }
}
