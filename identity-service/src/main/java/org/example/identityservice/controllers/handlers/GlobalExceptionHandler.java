package org.example.identityservice.controllers.handlers;

import org.example.identityservice.exeptions.NotSuchUserException;
import org.example.identityservice.exeptions.NotAuthException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotAuthException.class)
    public ResponseEntity<String> handleNotAuthException(NotAuthException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ex.getMessage());
    }

    @ExceptionHandler(NotSuchUserException.class)
    public ResponseEntity<String> handleNoSuchUserException(NotAuthException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
}
