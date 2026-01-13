package ru.kors.chatsservice.utils;

import ru.kors.chatsservice.models.entity.projection.ChatMemberInfo;

import java.nio.ByteBuffer;
import java.util.List;

public class ChatMemberBinaryEncoder {
    public static byte[] encode(List<ChatMemberInfo> list) {
        ByteBuffer buffer = ByteBuffer.allocate(list.size() * 16);
        for (ChatMemberInfo info : list) {
            buffer.putLong(info.getUserId());
            buffer.putLong(info.getRoleId());
        }
        return buffer.array();
    }
}
