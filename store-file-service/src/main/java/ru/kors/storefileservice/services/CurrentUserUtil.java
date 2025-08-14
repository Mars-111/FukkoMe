package ru.kors.storefileservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Component
public class CurrentUserUtil {
    public Mono<Long> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .handle((securityContext, sink) -> {
                    Authentication authentication = securityContext.getAuthentication();
                    if (authentication == null || !authentication.isAuthenticated()) {
                        sink.error(new RuntimeException("Unauthorized access"));
                        return;
                    }

                    Object principal = authentication.getPrincipal();
                    if (principal instanceof Jwt jwt) {
                        Object claim = jwt.getClaim("userId");
                        if (claim != null) {
                            sink.next(Long.parseLong(claim.toString()));
                            return;
                        }
                    }

                    sink.error(new RuntimeException("user_id not found in token"));
                });
    }
}
