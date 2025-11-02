//package ru.kors.socketbrokerservice.services;
//
//import io.jsonwebtoken.*;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import ru.kors.socketbrokerservice.models.entity.User;
//
//import java.security.PublicKey;
//
//@Service
//@Slf4j
//@RequiredArgsConstructor
//public class JwtService {
//
//    private final PublicKey publicKey;
//
//    public Claims validateToken(String token) {
//        try {
//            return Jwts.parser()
//                    .setSigningKey(publicKey)
//                    .parseClaimsJws(token)
//                    .getBody();
//        } catch (ExpiredJwtException e) {
//            log.error("Token has expired: {}", e.getMessage());
//        } catch (SignatureException e) {
//            log.error("Invalid token signature: {}", e.getMessage());
//        } catch (JwtException e) {
//            log.error("Invalid token: {}", e.getMessage());
//        } catch (Exception e) {
//            log.error("Token validation failed: {}", e.getMessage());
//        }
//        return null;
//    }
//
//
//}
