package ru.kors.chatsservice.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ru.kors.chatsservice.controllers.external.utils.CurrentUserUtil;
import ru.kors.chatsservice.controllers.external.dto.CreateMessageDTO;
import ru.kors.chatsservice.controllers.external.dto.UpdateMessageDTO;
import ru.kors.chatsservice.exceptions.BadRequestException;
import ru.kors.chatsservice.exceptions.DoesNotHaveAccessException;
import ru.kors.chatsservice.exceptions.NotFoundEntityException;
import ru.kors.chatsservice.models.AccessFileJWT;
import ru.kors.chatsservice.models.entity.enums.ChatEventType;
import ru.kors.chatsservice.models.constants.ChatRoleAccessFlags;
import ru.kors.chatsservice.models.entity.*;
import ru.kors.chatsservice.models.constants.MessageFlags;
import ru.kors.chatsservice.repositories.ChatRepository;
import ru.kors.chatsservice.repositories.MessageRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final CurrentUserUtil currentUserUtil;
    private final ChatService chatService;
    private final KafkaProducerService kafkaProducerService;
    private final ChatEventService chatEventService;
    private final FileJWTService fileJWTService;
    private final TimelineService timelineService;
    private final ChatRoleService chatRoleService;
    private final ObjectMapper objectMapper;
    private final ChatRepository chatRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public Message findById(Long messageId) {
        return messageRepository.findById(messageId).orElseThrow(() -> new NotFoundEntityException("Message not found"));
    }

    public Page<Message> findAllByChatId(Long chatId, Pageable pageable) {
        return messageRepository.findAllByChat_Id(chatId, pageable);
    }

    public Set<Message> findAllByChatId(Long chatId) {
        return messageRepository.findAllByChat_Id(chatId);
    }

    public Message createMessage(CreateMessageDTO messageDTO, Long senderId) {
        long userRoleAccessFlags = chatRoleService.findRoleAccessFlagsByUserIdAndChat(senderId, messageDTO.chatId());

        if ((userRoleAccessFlags & ChatRoleAccessFlags.WRITE) == 0) {
            throw new DoesNotHaveAccessException("User does not have access write to chat");
        }

        if ((userRoleAccessFlags & ChatRoleAccessFlags.MUTE) == 0) {
            throw new DoesNotHaveAccessException("User have mute");
        }

        if (messageDTO.replyToId() != null && messageDTO.forwardedFromId() != null) {
            throw new BadRequestException("You cannot reply and forward message at the same time");
        }

        Message message = new Message();

        if (messageDTO.fileTokens() != null) {
            List<AccessFileJWT> fileTokens = new ArrayList<>();
            for (String i : messageDTO.fileTokens()) {
                var accessFileJWT = fileJWTService.parseAccessUseCreatedFileJWT(i);
                if (!Objects.equals(senderId, accessFileJWT.userId()) || !accessFileJWT.subject().equals("file_create")) {
                    throw new DoesNotHaveAccessException("User does not have access to added file");
                }
                fileTokens.add(accessFileJWT);
            }
            for (AccessFileJWT jwt : fileTokens) {
                var fileMetadata = new FileMetadata(jwt);
                message.addFile(fileMetadata); // ← тут и message задается, и добавляется в коллекцию
            }
            message.setFlags(MessageFlags.setFlag(message.getFlags(), MessageFlags.HAS_FILE));
        }


        if (messageDTO.flags() != null) {
            message.setFlags(MessageFlags.sortFlagsDefaultUserToCreateMessage(messageDTO.flags()));
        }
        message.setChat(chatRepository.findById(messageDTO.chatId()).orElseThrow(() -> new NotFoundEntityException("Chat not found")));
        if (!messageDTO.content().isEmpty()) {
            message.setContent(messageDTO.content());
            message.setFlags(MessageFlags.setFlag(message.getFlags(), MessageFlags.HAS_TEXT));
        }

        message.setSenderId(senderId);

        if (messageDTO.replyToId() != null) {
            Message replyTo = findById(messageDTO.replyToId());
            if (!Objects.equals(replyTo.getChat().getId(), messageDTO.chatId())) {
                throw new BadRequestException("Reply to message is not in the same chat");
            }
            message.setReplyTo(replyTo);
            message.setFlags(MessageFlags.setFlag(message.getFlags(), MessageFlags.IS_REPLY));
        }
        else if (messageDTO.forwardedFromId() != null) {
            Message forwardedFrom = findById(messageDTO.forwardedFromId());
            if (!MessageFlags.isFlagSet(forwardedFrom.getFlags(), MessageFlags.ACCESS_FORWARDED)) {
                throw new DoesNotHaveAccessException("The selected message " + forwardedFrom.getId() + " cannot be forwarded.");
            }
            message.setForwardedFrom(forwardedFrom);
            message.setFlags(MessageFlags.setFlag(message.getFlags(), MessageFlags.IS_FORWARDED));
        }

        if ((
                (message.getFlags() & MessageFlags.HAS_TEXT) |
                (message.getFlags() & MessageFlags.HAS_FILE) |
                (message.getFlags() & MessageFlags.IS_FORWARDED)
            ) == 0) {
            throw new BadRequestException("Empty message");
        }

        // Получение порядкового номера сообщения в чате TIMELINE

        Long timelineId = timelineService.getNextMessageOrderId(messageDTO.chatId()); //Тут будет grpc запрос к микросервису который выдает timelineId
        message.setTimelineId(timelineId);

        //

        message = messageRepository.save(message);

        kafkaProducerService.send(message);

        return message;
    }

    public ChatEvent updateMessage(long messageId, UpdateMessageDTO updateMessageDTO, long senderRequestId) {
        Message message = findById(messageId);

        if (!message.getSenderId().equals(senderRequestId)) {
            throw new DoesNotHaveAccessException("User does not have access to message");
        }

        // Создаем событие изменения чата
        ChatEvent chatEvent = new ChatEvent();

        chatEvent.setType(ChatEventType.EDIT_MESSAGE);
        chatEvent.setChat(message.getChat());

        // Массив для хранения изменений

        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("message_id", message.getId());
        chatEvent.setData(objectNode);


        // Получение порядкового номера сообщения в чате TIMELINE

        Long timelineId = timelineService.getNextEventOrderId(message.getChat().getId());
        chatEvent.setTimelineId(timelineId);

        //

        message.setContent(updateMessageDTO.content());


        message.setFlags(MessageFlags.setFlag(message.getFlags(), MessageFlags.IS_EDITED));

        kafkaProducerService.send(chatEvent);

        messageRepository.save(message);


        return chatEventService.save(chatEvent);
    }

    public void deleteMessage(long messageId, long executorId) {
        Message message = findById(messageId);

        long userRoleAccessFlags = chatRoleService.findRoleAccessFlagsByUserIdAndChat(executorId, message.getChat().getId());

        if (
                (userRoleAccessFlags & ChatRoleAccessFlags.DELETE_OTHER_PEOPLE_MESSAGE) != 0 ||
                (message.getSenderId().equals(executorId) && (userRoleAccessFlags & ChatRoleAccessFlags.DELETE_YOUR_MESSAGE) != 0)
        ) {
            throw new DoesNotHaveAccessException("User does not have access delete this message in the chat");
        }

        // Создаем событие изменения чата
        ChatEvent chatEvent = new ChatEvent();
        chatEvent.setType(ChatEventType.DELETE_MESSAGE);
        chatEvent.setChat(message.getChat());

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode objectNode = mapper.createObjectNode();
        objectNode.put("message_id", messageId);

        chatEvent.setData(objectNode);
        //

        message.setFlags(MessageFlags.setFlag(message.getFlags(), MessageFlags.IS_DELETED));

        // Получение порядкового номера сообщения в чате TIMELINE
        Long timelineId = timelineService.getNextEventOrderId(message.getChat().getId());
        chatEvent.setTimelineId(timelineId);
        //

        messageRepository.save(message);

        kafkaProducerService.send(chatEventService.save(chatEvent));
    }

    public String getFileAccessJwt(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new DoesNotHaveAccessException("Message not found"));
        if (!chatService.isUserInChat(message.getChat().getId(), userId)) {
            throw new DoesNotHaveAccessException("User does not have access to message");
        }

        return fileJWTService.generateFileAccessToken(
                new HashSet<>(message.getFileList().stream().map(FileMetadata::getFileId).toList()),
                userId,
                180);
    }
}