package ru.kors.chatsservice.controllers.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.services.ChatRoleService;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
public class ChatRoleController {

    private final ChatRoleService chatRoleService;

    @GetMapping("/{id}")
    public ResponseEntity<ChatRole> getRoleById(@PathVariable Long id) {
        ChatRole role = chatRoleService.findById(id);
        return ResponseEntity.ok(role);
    }

    @GetMapping("/{id}/version")
    public ResponseEntity<Integer> getRoleVersion(@PathVariable Long id) {
        int version = chatRoleService.getRoleVersion(id);
        return ResponseEntity.ok(version);
    }
    


}
