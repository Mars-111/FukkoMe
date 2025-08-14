package org.example.identityservice.utils;

import org.example.identityservice.models.UserAuthentication;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class CurrentUserUtil {

    public static Long getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof UserAuthentication userAuth) {
            return userAuth.getUserId();
        }
        return null;
    }

}
