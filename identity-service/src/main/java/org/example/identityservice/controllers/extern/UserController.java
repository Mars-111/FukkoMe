package org.example.identityservice.controllers.extern;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.identityservice.controllers.extern.dto.UpdateAvatarDTO;
import org.example.identityservice.controllers.extern.dto.UpdateUserDTO;
import org.example.identityservice.models.entity.projection.UserProfileProjection;
import org.example.identityservice.models.entity.User;
import org.example.identityservice.services.KafkaProducerService;
import org.example.identityservice.services.UserService;
import org.example.identityservice.utils.CurrentUserUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserService userService;
    private final KafkaProducerService kafkaProducerService;

    @GetMapping("/{id}")
    public UserProfileProjection getUserProfileById(@PathVariable("id") Long id) {
        return userService.findUserProfileById(id);
    }

    @GetMapping("/version-verify/{userId}/{version}")
    public boolean isVersionSync(@PathVariable("userId") Long userId, @PathVariable("version") Integer version) {
        return userService.existsByIdAndVersion(userId, version);
    }

    @GetMapping("/{id}/version")
    public ResponseEntity<Integer> getVersion(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getVersion(id));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileProjection> updateUser(@RequestBody UpdateUserDTO updateUserDTO) {
        Long currentUserId = CurrentUserUtil.getCurrentUser();
        userService.updateUser(currentUserId, updateUserDTO);
        UserProfileProjection updatedUser = userService.findUserProfileById(currentUserId);
        assert currentUserId != null;
        kafkaProducerService.sendUserUpdates(currentUserId, updatedUser);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<UserProfileProjection> updateAvatar(@RequestBody UpdateAvatarDTO updateAvatarDTO) {
        Long currentUserId = CurrentUserUtil.getCurrentUser();
        userService.updateAvatar(currentUserId, updateAvatarDTO);
        UserProfileProjection updatedUser = userService.findUserProfileById(currentUserId);
        assert currentUserId != null;
        kafkaProducerService.sendUserUpdates(currentUserId, updatedUser);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{id}/created-at")
    public ResponseEntity<Long> getUserCreatedAt(@PathVariable("id") Long id) {
        Instant createdAt = userService.findUserCreatedAt(id);
        return ResponseEntity.ok(createdAt.toEpochMilli());
    }

    @GetMapping("/like/username/{usernamePart}")
    public ResponseEntity<?> getUsersByUsernamePart(@PathVariable("usernamePart") String usernamePart, @PathParam("limit") Integer limit) {
        return ResponseEntity.ok(userService.likeUsername(usernamePart, limit));
    }
}
