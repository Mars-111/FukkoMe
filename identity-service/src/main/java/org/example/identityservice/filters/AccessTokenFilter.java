package org.example.identityservice.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.identityservice.models.UserAuthentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccessTokenFilter extends OncePerRequestFilter {
    private final JwtDecoder jwtDecoder;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String jwtString = getJwtFromRequest(request);
        if (jwtString == null) {
            filterChain.doFilter(request, response);
            return;
        }
        log.info("filter 1");
        Jwt jwtEntity;
        try {
            log.info("Decoding JWT: {}", jwtString);
            jwtEntity = jwtDecoder.decode(jwtString); //ERROR
        } catch (Exception ex) {
            System.err.println("Ошибка при декодировании/верификации: " + ex.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (!"ACS".equals(jwtEntity.getClaim("t_type"))) {
            filterChain.doFilter(request, response);
            return;
        }
        log.info("filter 2");

        Object userIdClaim = jwtEntity.getClaim("userId");
        Long userId = null;

        log.info("filter 3");
        if (userIdClaim instanceof Number num) {
            userId = num.longValue();
        } else {
            filterChain.doFilter(request, response);
            return;
        }
        log.info("filter 4: " + userId);

        Instant exp = jwtEntity.getExpiresAt();

        if (exp == null || jwtEntity.getExpiresAt().isBefore(Instant.now())) {
            filterChain.doFilter(request, response);
            return;
        }
        log.info("filter 5");

        SecurityContextHolder.getContext().setAuthentication(new UserAuthentication(userId, true));
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return null;
        }
        return bearerToken.substring(7);
    }
}
