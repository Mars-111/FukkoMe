package org.example.identityservice.services;

import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.identityservice.controllers.extern.dto.CreateUserDTO;
import org.example.identityservice.controllers.extern.dto.UpdateAvatarDTO;
import org.example.identityservice.controllers.extern.dto.UpdateUserDTO;
import org.example.identityservice.exeptions.*;
import org.example.identityservice.models.entity.projection.UserIdAndPassword;
import org.example.identityservice.models.entity.projection.UserProfileProjection;
import org.example.identityservice.models.entity.User;
import org.example.identityservice.repositories.UserRepository;
import org.example.identityservice.repositories.dto.ModifyingAvatarDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileTokenService fileTokenService;

    public Long getUserIdIfExistsByUsernameAndPassword(String username, String password) {
        UserIdAndPassword userIdAndPassword = userRepository.findIdAndPasswordByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        if (!passwordEncoder.matches(password, userIdAndPassword.getPassword())) {
            throw new IllegalArgumentException("Invalid password for user: " + username);
        }
        return userIdAndPassword.getId();
    }

    public Long getUserIdIfExistsByEmailAndPassword(String email, String password) {
        UserIdAndPassword userIdAndPassword = userRepository.findIdAndPasswordByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        if (!passwordEncoder.matches(password, userIdAndPassword.getPassword())) {
            throw new IllegalArgumentException("Invalid password for user: " + email);
        }
        return userIdAndPassword.getId();
    }

    public User create(CreateUserDTO createUserDTO) {
        User user = new User();
        user.setUsername(createUserDTO.username());
        user.setEmail(createUserDTO.email());
        user.setPassword(passwordEncoder.encode(createUserDTO.password()));
        user.setEnabled(true);
        user.setVersion(0);

        Random random = new Random();
        Long number = -(random.nextLong(10) + 1);
        user.setSmallAvatarId(number);
        user.setLargeAvatarId(number);
        user.setFullscreenAvatarId(number);

        String conflictFields = null;
        if (userRepository.existsByUsername(user.getUsername())) {
            conflictFields = "username";
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            if (conflictFields == null) {
                conflictFields = "email";
            } else {
                conflictFields += " email";
            }
        }

        if (conflictFields != null) {
            log.error("Conflict fields: " + conflictFields);
            throw new ConflictException(conflictFields);
        }

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new UnknownException("Unknown error while creating user"); // если не удалось распознать, пробрасываем дальше
        }
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    public Instant findUserCreatedAt(Long id) {
        return userRepository.findUserCreatedAt(id);
    }

    public UserProfileProjection findUserProfileById(Long id) {
        return userRepository.findUserProfileById(id)
                .orElseThrow(() -> new NotSuchUserException("User not found with ID: " + id));
    }

    public boolean existsByIdAndVersion(Long id, Integer version) {
        return userRepository.existsByIdAndVersion(id, version);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public Integer getVersion(Long userId) {
        return userRepository.getVersionById(userId)
                .orElseThrow(() -> new NotSuchUserException("User not found with ID: " + userId));
    }

    @Transactional
    public void updateUser(Long userId, UpdateUserDTO updateUserDTO) {
        int modify = userRepository.update(userId, updateUserDTO);
        if (modify == 0) {
            throw new BadDataException("User not found or the data does not differ");
        }

    }

    private boolean verifyAvatarToken(Claims tokenClaim, Set<String> allowedExtensions, Integer side) {
        log.info("111");
        if (tokenClaim == null) {
            return false;
        }
        log.info("222");
        log.info("token private: " + tokenClaim.get("private", Boolean.class));
        if (tokenClaim.get("private", Boolean.class)) {
            return false;
        }
        log.info("333");
        String extension = tokenClaim.get("extension", String.class);
        if (!allowedExtensions.contains(extension)) {
            return false;
        }
        log.info("444");
        if (side != null) {
            Map<String, Object> fileMetadata = tokenClaim.get("fileMetadata", Map.class);
            Integer tokenWidth = (Integer) fileMetadata.get("width");
            Integer tokenHeight = (Integer) fileMetadata.get("height");
            if (!tokenWidth.equals(tokenHeight) || tokenWidth > side) {
                return false;
            }
        }
        log.info("555");

        return true;
    }

    @Transactional
    public void updateAvatar(Long currentUser, UpdateAvatarDTO updateAvatarDTO) {
        //НУЖНО ПРОВАЛИДИРОВАТЬ
        Claims originalClaim =
                fileTokenService.verifyUserCreatedAndGetClaims(updateAvatarDTO.originalAvatarToken(), currentUser);
        boolean originalAvatarValid = verifyAvatarToken(
                originalClaim,
                Set.of("jpg", "jpeg", "png"),
                null
        );
        if (!originalAvatarValid) {
            throw new InvalidFileToken("Invalid original avatar token");
        }

        Claims smallClaim =
                fileTokenService.verifyUserCreatedAndGetClaims(updateAvatarDTO.smallAvatarToken(), currentUser);
        boolean smallAvatarValid = verifyAvatarToken(
                smallClaim,
                Set.of("webp"),
                128
        );
        if (!smallAvatarValid) {
            throw new InvalidFileToken("Invalid small avatar token");
        }

        Claims largeClaim =
                fileTokenService.verifyUserCreatedAndGetClaims(updateAvatarDTO.largeAvatarToken(), currentUser);
        boolean largeAvatarValid = verifyAvatarToken(
                largeClaim,
                Set.of("webp"),
                512
        );
        if (!largeAvatarValid) {
            throw new InvalidFileToken("Invalid big avatar token");
        }

        Claims fullscreenClaim =
                fileTokenService.verifyUserCreatedAndGetClaims(updateAvatarDTO.largeAvatarToken(), currentUser);
        boolean fullscreenAvatarValid = verifyAvatarToken(
                largeClaim,
                Set.of("webp"),
                1280
        );
        if (!fullscreenAvatarValid) {
            throw new InvalidFileToken("Invalid big avatar token");
        }

        int modify = userRepository.updateAvatar(currentUser, new ModifyingAvatarDTO(
                    originalClaim.get("fileId", Long.class),
                    smallClaim.get("fileId", Long.class),
                    largeClaim.get("fileId", Long.class),
                    fullscreenClaim.get("fileId", Long.class)
                )
        );
        if (modify == 0) {
            throw new BadDataException("User not found or the data does not differ for ID: " + currentUser);
        }
    }

    public List<UserProfileProjection> likeUsername(String username, int limit) {
        if (username.length() < 3) {
            throw new BadDataException("Username part must be at least 3 characters long");
        }
        return userRepository.likeUsername(username, limit);
    }
}
