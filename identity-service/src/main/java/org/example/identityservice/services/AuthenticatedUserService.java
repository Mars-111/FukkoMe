package org.example.identityservice.services;

import org.example.identityservice.exeptions.NotAuthException;
import org.example.identityservice.models.AccessToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    public AccessToken getAccessToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new NotAuthException("Unauthorized access");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            AccessToken token = new AccessToken(jwt);
        }
        throw new NotAuthException("user_id not found in token");
    }

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new NotAuthException("Unauthorized access");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Long) {
            return (Long) principal;
        }

        throw new NotAuthException("user_id not found in token");
    }
}
