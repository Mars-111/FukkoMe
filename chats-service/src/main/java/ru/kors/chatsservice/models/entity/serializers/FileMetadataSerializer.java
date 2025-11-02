package ru.kors.chatsservice.models.entity.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import ru.kors.chatsservice.models.entity.FileMetadata;

import java.io.IOException;

public class FileMetadataSerializer extends JsonSerializer<FileMetadata> {

    @Override
    public void serialize(FileMetadata fileMetadata, JsonGenerator gen, SerializerProvider serializerProvider) throws IOException {
        gen.writeStartObject();
        gen.writeNumberField("file_id", fileMetadata.getFileId());
        if (fileMetadata.getMessage().getId() != null) {
            gen.writeNumberField("message_id", fileMetadata.getMessage().getId());
        }
        gen.writeStringField("extension", fileMetadata.getExtension());
        gen.writeStringField("filename", fileMetadata.getFilename());
        gen.writeNumberField("size", fileMetadata.getSize());

        if (fileMetadata.getHeight() != null) {
            gen.writeNumberField("height", fileMetadata.getHeight());
        }
        if (fileMetadata.getWidth() != null) {
            gen.writeNumberField("width", fileMetadata.getWidth());
        }
        gen.writeEndObject();
    }
}
