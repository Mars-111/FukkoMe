package ru.kors.storefileservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;

@Configuration
public class JwtDecoderBean {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwk;

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        return new CustomReactiveEdDSAJwtDecoder(jwk);
    }

}
