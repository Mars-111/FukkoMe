package ru.kors.chatsservice.models.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.kors.chatsservice.models.AccessFileJWT;
import ru.kors.chatsservice.models.entity.serializers.FileMetadataSerializer;

@Entity
@Getter
@Setter
@Table(name = "file_meta")
@AllArgsConstructor
@NoArgsConstructor
@JsonSerialize(using = FileMetadataSerializer.class)
public class FileMetadata {
    @Id
    @Column(name = "file_id", unique = true)
    private Long fileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;

    @Column(nullable = false)
    private String extension;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private Long size;

    private Integer height;

    private Integer width;


    public FileMetadata(AccessFileJWT jwt) {
        this.fileId = jwt.fileId();
        this.extension = jwt.extension();
        this.size = jwt.size();
        this.filename = jwt.filename();
        this.height = jwt.height();
        this.width = jwt.width();
    }

}
