package org.example.identityservice.controllers.extern;

import com.nimbusds.jose.JOSEException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.identityservice.controllers.extern.dto.AuthenticateRequestDTO;
import org.example.identityservice.exeptions.NotSuchUserException;
import org.example.identityservice.exeptions.NotAuthException;
import org.example.identityservice.services.authenticatedUserService;
import org.example.identityservice.utils.PCKEUtil;
import org.example.identityservice.factories.JWTFactory;
import org.example.identityservice.models.AccessToken;
import org.example.identityservice.models.AuthCodeData;
import org.example.identityservice.models.RefreshToken;
import org.example.identityservice.models.entity.Client;
import org.example.identityservice.services.ClientCacheService;
import org.example.identityservice.services.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Slf4j
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final ClientCacheService clientCacheService;
    private final UserService userService;
    private final authenticatedUserService authenticatedUserService;
    @Value("${jwt.allowed-redirect-uri}")
    private List<String> allowedRedirectUris;
    @Value("${jwt.refresh.live-time}")
    private int refreshLiveTime;
    private final PasswordEncoder passwordEncoder;
    private final JWTFactory jwtFactory;
    private final JwtDecoder jwtDecoder;

    private final RedisTemplate<String, String> redisTemplate;

    @PostConstruct
    private void init() {
        String uris = allowedRedirectUris.stream().collect(Collectors.joining(","));
        log.info("allowed redirect uris: " + uris);
    }

    private Long getUserIdByUsernameOrEmail(String usernameOrEmail, String password) {
        Long userId = null;
        if (usernameOrEmail.contains("@")) {
            //email
            log.info("Processing login for email: {}", usernameOrEmail);
            userId = userService.getUserIdIfExistsByEmailAndPassword(usernameOrEmail, password);
        }
        else {
            //username
            log.info("Processing login for username: {}", usernameOrEmail);
            userId = userService.getUserIdIfExistsByUsernameAndPassword(usernameOrEmail, password);
        }
        if (userId == null) {
            log.error("User not found or invalid credentials for username/email: {}", usernameOrEmail);
            throw new NotSuchUserException("User not found or invalid credentials for username/email: " + usernameOrEmail);
        }
        return userId;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(
                                    @RequestParam String grantType,
                                    @RequestParam(required = false) String redirectUrl,
                                    @RequestParam String clientId,
                                    @RequestParam(required = false)
                                    @Size(min = 43, max = 128, message = "codeChallenge length must be between 43 and 128 characters")
                                    @Pattern(regexp = "^[A-Za-z0-9\\-._~]+$", message = "codeChallenge must be base64url-safe")
                                    String codeChallenge,
                                    @RequestBody AuthenticateRequestDTO body,
                                    HttpServletResponse response) throws JOSEException {
        Long userId = null;

        boolean redirectUrlAllowed = redirectUrl == null || allowedRedirectUris.stream().anyMatch(redirectUrl::startsWith);

        if (!redirectUrlAllowed) {
            return ResponseEntity.badRequest().body("Invalid redirect URI");
        }
        Client client = clientCacheService.getById(clientId);
        if (client == null) {
            return ResponseEntity.badRequest().body("Client not found");
        }

        if (grantType.equals("authorization_code")) {
            try {
                userId = getUserIdByUsernameOrEmail(body.username(), body.password());
            }
            catch (NotSuchUserException e) {
                return ResponseEntity.badRequest().body("Invalid username/email or password");
            }
            catch (Exception e) {
                return ResponseEntity.badRequest().body("Error in database, during search user");
            }

            AuthCodeData authCodeData = new AuthCodeData();
            authCodeData.setUserId(userId);
            authCodeData.setClientId(clientId);
            authCodeData.setCodeChallenge(codeChallenge);

            String code = UUID.randomUUID().toString();

            Boolean isSet = redisTemplate.opsForValue().setIfAbsent(code, authCodeData.toJson(), Duration.ofMinutes(5));
            if (Boolean.FALSE.equals(isSet)) {
                return ResponseEntity.badRequest().body("Code challenge already used");
            }

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, redirectUrl + "?code=" + code)
                    .build();
        }
        else if (grantType.equals("cookie")) {
            if (client.getSecret() != null) {
                return ResponseEntity.badRequest().body(
                        "When grant type == cookie, client secret must be == null!" +
                        "This grant type is not safe for working with secrets."
                );
            }
            try {
                userId = getUserIdByUsernameOrEmail(body.username(), body.password());
            }
            catch (NotSuchUserException e) {
                return ResponseEntity.badRequest().body("Invalid username/email or password");
            }
            catch (Exception e) {
                return ResponseEntity.badRequest().body("Error in database, during search user");
            }
            RefreshToken refreshToken = RefreshToken.builder()
                    .client(clientId)
                    .userId(userId)
                    .accessTokenLifetime(120)
                    .expiresAt(Instant.now().plusSeconds(refreshLiveTime))
                    .build();
            Cookie cookie = new Cookie("refreshToken", jwtFactory.toJWT(refreshToken));
            cookie.setPath("/api/refresh");
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setMaxAge(refreshLiveTime);
            response.addCookie(cookie);
            cookie.setDomain("id.mars-ssn.ru");
            return ResponseEntity.ok().build();
        }
        else {
            log.error("grant type {} is not supported", grantType);
            return ResponseEntity.badRequest().body("Unsupported grant type: " + grantType);
        }
    }

    @PostMapping("/token")
    public ResponseEntity<?> getJwtByVerifyCode(
            HttpServletResponse response,
            @RequestHeader(name = "CodeVerifier") String codeVerifier,
            @RequestHeader(name = "Code") String code,
            @RequestHeader(name = "ClientSecret", required = false) String clientSecret
            ) throws Exception {
        String authCodeDataJson = redisTemplate.opsForValue().get(code);
        if (authCodeDataJson == null) {
            log.error("Invalid or expired code: {}", code);
            return ResponseEntity.badRequest().body("Invalid or expired code");
        }
        AuthCodeData authCodeData = new AuthCodeData(authCodeDataJson);
        if (!PCKEUtil.isCodeVerifierValid(codeVerifier, authCodeData.getCodeChallenge())) {
            log.error("Invalid code verifier: {}", codeVerifier);
            return ResponseEntity.badRequest().body("Invalid code verifier");
        }
        Client client = clientCacheService.getById(authCodeData.getClientId());
        if (!client.getSecret().equals(clientSecret)) {
            return ResponseEntity.badRequest().body("Client secret does not match");
        }
        redisTemplate.delete(code);
        RefreshToken refreshToken = new RefreshToken(authCodeData);
        refreshToken.setExpiresAt(Instant.now().plusSeconds(refreshLiveTime));

        return ResponseEntity.ok(jwtFactory.toJWT(refreshToken));
    }

    @PostMapping("/refresh")
//    @CrossOrigin(origins = "https://mars-ssn.ru", methods = RequestMethod.POST)
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = true) String refreshToken) throws JOSEException, ParseException {
        log.info("--- Refreshing token ---");
        Jwt refreshJwt;
        try {
             refreshJwt = jwtDecoder.decode(refreshToken);
        } catch (JwtException ex) {
            throw new NotAuthException(ex.getMessage());
        }
        RefreshToken refreshTokenEntity = new RefreshToken(refreshJwt);

        Instant exp = refreshTokenEntity.getExpiresAt();
        if (exp == null || exp.isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AccessToken accessTokenEntity = new AccessToken(refreshJwt);

        return ResponseEntity.ok(jwtFactory.toJWT(accessTokenEntity));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setPath("/api/refresh");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        cookie.setDomain("id.mars-ssn.ru");
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }
}
