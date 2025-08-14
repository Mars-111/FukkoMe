package org.example.identityservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.identityservice.controllers.extern.dto.CreateUserDTO;
import org.example.identityservice.controllers.extern.dto.UpdateAvatarDTO;
import org.example.identityservice.controllers.extern.dto.UpdateUserDTO;
import org.example.identityservice.exeptions.InvalidFileToken;
import org.example.identityservice.exeptions.NotSuchUserException;
import org.example.identityservice.models.UserIdAndPassword;
import org.example.identityservice.models.UserInfo;
import org.example.identityservice.models.entity.User;
import org.example.identityservice.repositories.UserRepository;
import org.example.identityservice.repositories.dto.UserUpdateFields;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


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
        return userRepository.save(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    public UserInfo getUserInfoById(Long id) {
        return userRepository.findInfoById(id)
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
       UserUpdateFields updateUserFields =  new UserUpdateFields(userId);
       if (updateUserDTO.username() != null) {
           updateUserFields.setUsername(updateUserDTO.username());
       }
       log.info("111");
       log.info("Avatar created token: " + updateUserDTO.avatarFileCreatedToken());
       if (updateUserDTO.avatarFileCreatedToken() != null) {
           log.info("222");
           Long avatarFileId = fileTokenService
                   .verifyUserCreatedAndGetFileIdByCreatedFileToken(updateUserDTO.avatarFileCreatedToken(), userId);
           if (avatarFileId == null) {
               throw new InvalidFileToken("invalid file token");
           }
           else {
               log.info("Updating user avatar file with ID: " + avatarFileId);
               updateUserFields.setAvatarId(avatarFileId);
           }
       }
       log.info("333");
       log.info("Update user avatar file id: " + updateUserFields.getAvatarId());
       userRepository.update(updateUserFields);
    }

    public Integer updateUserAndReturnVersion(Long userId, UpdateUserDTO updateUserDTO) {
        UserUpdateFields updateUserFields =  new UserUpdateFields(userId);
        if (updateUserDTO.username() != null) {
            updateUserFields.setUsername(updateUserDTO.username());
        }
        log.info("111");
        log.info("Avatar created token: " + updateUserDTO.avatarFileCreatedToken());
        if (updateUserDTO.avatarFileCreatedToken() != null) {
            log.info("222");
            Long avatarFileId = fileTokenService
                    .verifyUserCreatedAndGetFileIdByCreatedFileToken(updateUserDTO.avatarFileCreatedToken(), userId);
            if (avatarFileId == null) {
                throw new InvalidFileToken("invalid file token");
            }
            else {
                log.info("Updating user avatar file with ID: " + avatarFileId);
                updateUserFields.setAvatarId(avatarFileId);
            }
        }
        log.info("333");
        log.info("Update user avatar file id: " + updateUserFields.getAvatarId());
        return userRepository.updateAndReturnVersion(updateUserFields);
    }

    public User updateUserAndReturnUser(Long userId, UpdateUserDTO updateUserDTO) {
        UserUpdateFields updateUserFields =  new UserUpdateFields(userId);
        if (updateUserDTO.username() != null) {
            updateUserFields.setUsername(updateUserDTO.username());
        }
        log.info("111");
        log.info("Avatar created token: " + updateUserDTO.avatarFileCreatedToken());
        if (updateUserDTO.avatarFileCreatedToken() != null) {
            log.info("222");
            Long avatarFileId = fileTokenService
                    .verifyUserCreatedAndGetFileIdByCreatedFileToken(updateUserDTO.avatarFileCreatedToken(), userId);
            if (avatarFileId == null) {
                throw new InvalidFileToken("invalid file token");
            }
            else {
                log.info("Updating user avatar file with ID: " + avatarFileId);
                updateUserFields.setAvatarId(avatarFileId);
            }
        }
        log.info("Update user username: " + updateUserFields.getUsername());
        log.info("Update user avatar file id: " + updateUserFields.getAvatarId());
        return userRepository.updateAndReturnUser(updateUserFields);
    }

    public User updateAvatar(Long currentUser, UpdateAvatarDTO updateAvatarDTO) {
        //TODO
        return null;
    }
}
