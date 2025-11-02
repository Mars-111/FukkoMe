package ru.kors.chatsservice.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.kors.chatsservice.exceptions.NotFoundEntityException;
import ru.kors.chatsservice.models.entity.JoinRequest;
import ru.kors.chatsservice.repositories.JoinRequestRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;

    public List<JoinRequest> findAll() {
        return joinRequestRepository.findAll();
    }

    public List<JoinRequest> findByChatId(Long chatId) {
        return joinRequestRepository.findByChatId(chatId);
    }

    public JoinRequest findById(Long requestId) {
        return joinRequestRepository.findById(requestId).orElseThrow(() -> new NotFoundEntityException("Join request not found"));
    }

    public List<JoinRequest> findByUserId(Long userId) {
        return joinRequestRepository.findByUserId(userId);
    }
//
//    public JoinRequest createJoinRequest(User user, Chat chat) {
//        if (!chat.getPrivateChat()) {
//            throw new BadRequestException("Chat is not private");
//        }
//        JoinRequest request = new JoinRequest();
//        request.setUser(user);
//        request.setChat(chat);
//        request.setTimestamp(LocalDateTime.now());
//
//        UserEvent userEvent = new UserEvent();
//        userEvent.setType("new join request");
//        userEvent.setUser(chat.getOwner());
//
//        ObjectMapper mapper = new ObjectMapper();
//        ObjectNode data = mapper.createObjectNode();
//        data.put("chat_id", chat.getId());
//
//        userEvent.setData(data);
//        //TODO
//
//
//
//        //TODO
//        //kafkaProducerService.sendPersonal();
//
//
//        return joinRequestRepository.save(request);
//    }

//    public void acceptJoinRequest(JoinRequest request) {
//        User user = request.getUser();
//        user.getChats().add(request.getChat());
//
//        userService.saveUser(user);
//        joinRequestRepository.delete(request);
//    }

    public void deleteById(Long requestId) {
        joinRequestRepository.deleteById(requestId);
    }
}
