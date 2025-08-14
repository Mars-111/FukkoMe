package org.example.identityservice.controllers.extern;

import lombok.RequiredArgsConstructor;
import org.example.identityservice.controllers.extern.dto.UpdateAvatarDTO;
import org.example.identityservice.controllers.extern.dto.UpdateUserDTO;
import org.example.identityservice.models.UserInfo;
import org.example.identityservice.models.entity.User;
import org.example.identityservice.services.UserService;
import org.example.identityservice.utils.CurrentUserUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public UserInfo getUserById(@PathVariable("id") Long id) {
        return userService.getUserInfoById(id);
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
    public ResponseEntity<User> updateUser(@RequestBody UpdateUserDTO updateUserDTO) {
        return ResponseEntity.ok(userService.updateUserAndReturnUser(CurrentUserUtil.getCurrentUser(), updateUserDTO));
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<User> updateAvatar(@RequestBody UpdateAvatarDTO updateAvatarDTO) {
        return ResponseEntity.ok(userService.updateAvatar(CurrentUserUtil.getCurrentUser(), updateAvatarDTO));
}
