package ru.kors.storefileservice.services;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.jpeg.JpegDirectory;
import lombok.extern.slf4j.Slf4j;
import ru.kors.storefileservice.models.FileMetadata;

import java.io.ByteArrayInputStream;

@Slf4j
public class MetadataParser {

    public static FileMetadata extractFileMetadata(byte[] headerBytes, String extension) {
        if (headerBytes.length < 12) {
            throw new IllegalArgumentException("Header too small: " + headerBytes.length);
        }

        try {
            // PNG
            if (extension.equals("png")) {
                int width = readIntBigEndian(headerBytes, 16);
                int height = readIntBigEndian(headerBytes, 20);
                return new FileMetadata(width, height);
            }

            // GIF
            if (extension.equals("gif")) {
                int width = readIntLittleEndian(headerBytes, 6);
                int height = readIntLittleEndian(headerBytes, 8);
                return new FileMetadata(width, height);
            }

            // WEBP
            if (extension.equals("webp")) {
                // VP8X (расширенный)
                if (headerBytes.length >= 30 && headerBytes[12] == 'V' && headerBytes[13] == 'P' && headerBytes[14] == '8' && headerBytes[15] == 'X') {
                    int width = ((headerBytes[24] & 0xFF) | ((headerBytes[25] & 0xFF) << 8) | ((headerBytes[26] & 0xFF) << 16)) + 1;
                    int height = ((headerBytes[27] & 0xFF) | ((headerBytes[28] & 0xFF) << 8) | ((headerBytes[29] & 0xFF) << 16)) + 1;
                    return new FileMetadata(width, height);
                }

                // VP8 (Lossy)
                if (headerBytes.length >= 20 && headerBytes[12] == 'V' && headerBytes[13] == 'P' && headerBytes[14] == '8' && headerBytes[15] == ' ') {
                    int width = (headerBytes[26] & 0xFF) | ((headerBytes[27] & 0xFF) << 8);
                    int height = (headerBytes[28] & 0xFF) | ((headerBytes[29] & 0xFF) << 8);
                    return new FileMetadata(width, height);
                }

                // VP8L (Lossless)
                if (headerBytes.length >= 25 && headerBytes[12] == 'V' && headerBytes[13] == 'P' && headerBytes[14] == '8' && headerBytes[15] == 'L') {
                    int b1 = headerBytes[21] & 0xFF;
                    int b2 = headerBytes[22] & 0xFF;
                    int b3 = headerBytes[23] & 0xFF;
                    int b4 = headerBytes[24] & 0xFF;
                    int width = 1 + (((b2 & 0x3F) << 8) | b1);
                    int height = 1 + (((b4 & 0x0F) << 10) | (b3 << 2) | ((b2 & 0xC0) >> 6));
                    return new FileMetadata(width, height);
                }
            }

            // JPEG (используем metadata-extractor)
            if (extension.equals("jpeg") || extension.equals("jpg")) {
                Metadata metadata = ImageMetadataReader.readMetadata(new ByteArrayInputStream(headerBytes));
                JpegDirectory jpegDirectory = metadata.getFirstDirectoryOfType(JpegDirectory.class);
                if (jpegDirectory != null) {
                    int width = jpegDirectory.getImageWidth();
                    int height = jpegDirectory.getImageHeight();
                    return new FileMetadata(width, height);
                }
            }

        } catch (Exception e) {
            log.warn("Failed to extract metadata: {}", e.getMessage(), e);
        }

        return null;
    }

    private static boolean isPng(byte[] bytes) {
        return bytes.length >= 8 &&
                bytes[0] == (byte) 0x89 &&
                bytes[1] == 0x50 &&
                bytes[2] == 0x4E &&
                bytes[3] == 0x47;
    }

    private static boolean isGif(byte[] bytes) {
        return bytes.length >= 6 &&
                bytes[0] == 'G' &&
                bytes[1] == 'I' &&
                bytes[2] == 'F';
    }

    private static boolean isWebp(byte[] bytes) {
        return bytes.length >= 12 &&
                bytes[0] == 'R' &&
                bytes[1] == 'I' &&
                bytes[2] == 'F' &&
                bytes[3] == 'F' &&
                bytes[8] == 'W' &&
                bytes[9] == 'E' &&
                bytes[10] == 'B' &&
                bytes[11] == 'P';
    }

    private static boolean isJpeg(byte[] bytes) {
        return bytes.length >= 2 &&
                bytes[0] == (byte) 0xFF &&
                bytes[1] == (byte) 0xD8;
    }

    private static int readIntBigEndian(byte[] bytes, int offset) {
        return ((bytes[offset] & 0xFF) << 24) |
                ((bytes[offset + 1] & 0xFF) << 16) |
                ((bytes[offset + 2] & 0xFF) << 8) |
                (bytes[offset + 3] & 0xFF);
    }

    private static int readIntLittleEndian(byte[] bytes, int offset) {
        return ((bytes[offset + 1] & 0xFF) << 8) |
                (bytes[offset] & 0xFF);
    }
}
