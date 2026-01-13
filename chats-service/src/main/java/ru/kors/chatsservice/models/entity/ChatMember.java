package ru.kors.chatsservice.models.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.kors.chatsservice.models.entity.embeddable.ChatMemberId;


@Entity
@Table(
        name = "chat_members",
        indexes = {
                @Index(name = "idx_chat_members_chat_id", columnList = "chat_id"),
                @Index(name = "idx_chat_members_user_id", columnList = "user_id")
                //Искать по роли следует с помощью WHERE chat_id = ? AND role_id = ?, тк так мы осмеем по индексу нужные поля и там уже по медленному role_id найдем быстрее че надо
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMember {
    @EmbeddedId
    private ChatMemberId id;

    @Column(name = "role_id", nullable = false)
    private Long roleId;
}
