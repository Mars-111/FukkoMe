package ru.kors.storefileservice.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import ru.kors.storefileservice.controllers.dto.FileViewDTO;

import java.time.Instant;

@Table("files")
@Getter
@Setter
@Builder
public class File {
    @Id
    private Long id; //Not null

    private String key; //Уникальный ключ для доступа к файлу. Not null

    @Column(value = "owner_id")
    private Long ownerId; //Not null

    @Column(value = "extension")
    private String extension; //Not null, например "jpg", "png", "mp4" и т.д.

    @Column(value = "size")
    private Long size; //Размер в байтах. Not null

    @Column(value = "filename")
    private String filename; //Имя файла, которое будет использоваться при скачивании. Not null

    private String status; //Not null

    @Column(value = "is_private")
    private boolean isPrivate;

    @Column(value = "created_at")
    private Instant createdAt; //В реактивном придется ручками устанавливать. Not null


    public FileViewDTO toFileViewDTO(String urlS3) {
        return new FileViewDTO(id, extension, size, filename, urlS3, createdAt);
    }

}
