package ru.kors.chatsservice.controllers.external.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import ru.kors.chatsservice.exceptions.NotAuthException;
import ru.kors.chatsservice.exceptions.NotFoundEntityException;
import ru.kors.chatsservice.models.entity.Chat;

@RequiredArgsConstructor
@Component
public class CurrentUserUtil {

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new NotAuthException("Unauthorized access");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            Object claim = jwt.getClaim("userId");
            if (claim != null) {
                return Long.parseLong(claim.toString());
            }
        }

        throw new NotFoundEntityException("userId not found in token");
    }
}
