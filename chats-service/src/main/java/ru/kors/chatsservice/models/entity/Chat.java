package ru.kors.chatsservice.models.entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.kors.chatsservice.models.entity.deserializers.ChatDeserializer;
import ru.kors.chatsservice.models.entity.enums.ChatType;
import ru.kors.chatsservice.models.entity.serializers.ChatSerializer;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "chats")
@JsonSerialize(using = ChatSerializer.class)
@JsonDeserialize(using = ChatDeserializer.class)
@NoArgsConstructor
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer version = 0;

    @Column(unique = true)
    private String tag;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatType type;

    @JoinColumn(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name="original_avatar_id")
    private Long originalAvatarId;

    @Column(name = "small_avatar_id")
    private Long smallAvatarId;

    @Column(name = "large_avatar_id")
    private Long largeAvatarId;

    @Column(name = "fullscreen_avatar_id")
    private Long fullscreenAvatarId;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Message> messages;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<ChatEvent> events;

    //Запросы на вступление в чат. Он должен быть null если privateChat = false.
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<JoinRequest> joinRequests;

    //Пользователи с ролями в чате
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<ChatRole> chatRoles;

    @OneToOne
    @JoinColumn(name = "default_role_id")
    private ChatRole defaultRole;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    private void setTimestamp() {
        this.createdAt = Instant.now();
    }

    public Chat(String tag, String name, ChatType type, Long ownerId) {
        this.tag = tag;
        this.name = name;
        this.type = type;
        this.ownerId = ownerId;
    }
}



//    @ElementCollection
//    @CollectionTable(
//            name = "chat_users",
//            joinColumns = @JoinColumn(name = "chat_id")
//    )
//    @Column(name = "user_id")
//    private Set<Long> userIds = new HashSet<>();