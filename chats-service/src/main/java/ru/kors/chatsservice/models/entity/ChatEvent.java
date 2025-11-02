package ru.kors.chatsservice.models.entity;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.hibernate.annotations.JdbcTypeCode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.type.SqlTypes;
import ru.kors.chatsservice.models.entity.deserializers.ChatEventDeserializer;
import ru.kors.chatsservice.models.entity.enums.ChatEventType;
import ru.kors.chatsservice.models.entity.serializers.ChatEventSerializer;

import java.time.Instant;

@Getter
@Setter
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name = "chats_events", indexes = {
        @Index(name = "idx_chat_events_type", columnList = "type"),
        @Index(name = "idx_chat_events_chat", columnList = "chat_id")
})
@JsonSerialize(using = ChatEventSerializer.class)
@JsonDeserialize(using = ChatEventDeserializer.class)
public class ChatEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timeline_id", nullable = false)
    private Integer timelineId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ChatEventType type;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "jsonb")
    private JsonNode data;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @PrePersist
    private void setTimestamp() {
        this.timestamp = Instant.now();
    }
}