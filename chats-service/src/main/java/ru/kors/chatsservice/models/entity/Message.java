package ru.kors.chatsservice.models.entity;


import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.kors.chatsservice.models.entity.deserializers.MessageDeserializer;
import ru.kors.chatsservice.models.entity.serializers.MessageSerializer;


import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "messages", indexes = {
        @Index(name = "idx_messages_chat_id", columnList = "chatId"),
        @Index(name = "idx_messages_sender_id", columnList = "sender_id")
})
@JsonSerialize(using = MessageSerializer.class)
@JsonDeserialize(using = MessageDeserializer.class)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_timeline_id", nullable = false)
    private Long timelineId;

    private Integer flags = 0; //для разных флагов (например, закреп, удалено и т.д.)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    private String content;

    @OneToMany(mappedBy = "message", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FileMetadata> fileList =  new ArrayList<>(); //List что бы сохранять порядок медиафайлов

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "forwarded_id")
    private Message forwardedFrom;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    @PrePersist
    private void setTimestamp() {
        this.timestamp = Instant.now();
    }


    public void addFile(FileMetadata file) {
        file.setMessage(this);
        fileList.add(file); //!!!! ПОМЕНЯЛ МЕСТАМИ
    }

}
