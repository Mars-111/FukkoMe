package ru.kors.chatsservice.models.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.kors.chatsservice.models.entity.embeddable.UserChatRoleId;


@Entity
@Table(name = "user_role_map")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserChatRoleMapping {
    @EmbeddedId
    private UserChatRoleId id;

    @Column(name = "role_id", nullable = false)
    private Long roleId;
}
