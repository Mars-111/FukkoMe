package ru.kors.chatsservice.models.constants;

public class ChatRoleAccessFlags {
    public static final long BAN                         = 1L << 0;
    public static final long MUTE                        = 1L << 1;
    public static final long WRITE                       = 1L << 2;
    public static final long SEND_TEXT                   = 1L << 3;
    public static final long SEND_FILE                   = 1L << 4;
    public static final long SEND_STICKER                = 1L << 5;
    public static final long SEND_REACTIONS              = 1L << 6;
    public static final long REPLY_MESSAGE               = 1L << 7;
    public static final long FORWARDED_MESSAGE           = 1L << 8;
    public static final long PING_USER                   = 1L << 9;
    public static final long PING_ROLE                   = 1L << 10;
    public static final long PING_ALL                    = 1L << 11;
    public static final long PIN_MESSAGE                 = 1L << 12;
    public static final long DELETE_YOUR_MESSAGE         = 1L << 13;
    public static final long EDIT_YOUR_MESSAGE           = 1L << 14;
    public static final long DELETE_OTHER_PEOPLE_MESSAGE = 1L << 15;
    public static final long CHANGE_CHAT_INFO            = 1L << 16;
    public static final long REVIEW_MEMBERSHIP_REQUEST   = 1L << 17;
    public static final long BAN_MEMBERS                 = 1L << 18;
    public static final long MUTE_MEMBERS                = 1L << 19;
    public static final long ASSIGN_ROLE                 = 1L << 20;
    public static final long CREATE_ROLES                = 1L << 21;
    public static final long OWNER                       = 1L << 22;

    public static long ownerAccessFlags() {
        return  WRITE + SEND_TEXT + SEND_FILE + SEND_STICKER +
                SEND_REACTIONS + REPLY_MESSAGE + FORWARDED_MESSAGE +
                PING_USER + PING_ROLE + PING_ALL + PIN_MESSAGE +
                DELETE_YOUR_MESSAGE + EDIT_YOUR_MESSAGE + DELETE_OTHER_PEOPLE_MESSAGE +
                CHANGE_CHAT_INFO + REVIEW_MEMBERSHIP_REQUEST + BAN_MEMBERS + MUTE_MEMBERS +
                ASSIGN_ROLE + CREATE_ROLES + OWNER;
    }

    public static long defaultRoleAccessFlags() {
        return  WRITE + SEND_TEXT + SEND_FILE + SEND_STICKER +
                SEND_REACTIONS + REPLY_MESSAGE + FORWARDED_MESSAGE +
                PING_USER + PING_ROLE + PING_ALL + PIN_MESSAGE +
                DELETE_YOUR_MESSAGE + EDIT_YOUR_MESSAGE;
    }



}
