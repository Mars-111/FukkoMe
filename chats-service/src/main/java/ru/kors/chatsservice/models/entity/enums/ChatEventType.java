package ru.kors.chatsservice.models.entity.enums;

public enum ChatEventType {
    DELETE_MESSAGE,
    EDIT_MESSAGE,
    EDIT_CHAT,
    JOIN,
    LEAVE,
    BAN,
    MUTE;

    public static ChatEventType fromString(String s) {
        for (ChatEventType t : ChatEventType.values()) {
            if (t.name().equalsIgnoreCase(s)) {
                return t;
            }
        }
        return null; // или default
    }
}
