package ru.kors.chatsservice.models.entity.enums;

public enum ChatType {
    PRIVATE,
    PUBLIC_GROUP,
    PRIVATE_GROUP,
    PUBLIC_CHANNEL,
    PRIVATE_CHANNEL;

    public static ChatType fromString(String s) {
        for (ChatType t : ChatType.values()) {
            if (t.name().equalsIgnoreCase(s)) {
                return t;
            }
        }
        return null; // или default
    }
}
