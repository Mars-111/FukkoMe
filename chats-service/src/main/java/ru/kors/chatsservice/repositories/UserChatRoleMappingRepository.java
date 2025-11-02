package ru.kors.chatsservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.models.entity.UserChatRoleMapping;
import ru.kors.chatsservice.models.entity.embeddable.UserChatRoleId;
import ru.kors.chatsservice.repositories.dto.AccessFlagsAndRankDTO;

import java.util.Optional;

public interface UserChatRoleMappingRepository extends JpaRepository<UserChatRoleMapping, UserChatRoleId> {

    @Query(value = """
        SELECT r.*
        FROM user_role_map ucrm
        JOIN chat_role r ON ucrm.role_id = r.id
        WHERE ucrm.user_id = :userId
          AND ucrm.chat_id = :chatId
          AND r.chat_id = :chatId
        LIMIT 1
    """, nativeQuery = true)
    Optional<ChatRole> findUserChatRole(long userId, long chatId);

    @Query("""
        SELECT r.accessFlags AS accessFlag, r.rank AS rank
        FROM UserChatRoleMapping ucrm
        JOIN ChatRole r ON ucrm.roleId = r.id
        WHERE ucrm.id.userId = :userId
          AND ucrm.id.chatId = :chatId
          AND r.chat.id = :chatId
    """)
    Optional<AccessFlagsAndRankDTO> findRoleAccessFlagsAndRankByUserIdAndChatId(long userId, long chatId);

    @Query("""
        SELECT r.accessFlags
        FROM UserChatRoleMapping ucrm
        JOIN ChatRole r ON ucrm.roleId = r.id
        WHERE ucrm.id.userId = :userId
          AND ucrm.id.chatId = :chatId
          AND r.chat.id = :chatId
    """)
    Optional<Long> findRoleAccessFlagsByUserIdAndChatId(long userId, long chatId);

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO user_role_map (user_id, chat_id, role_id)
        VALUES (:userId, :chatId, :roleId)
        ON CONFLICT (user_id, chat_id)
        DO UPDATE SET role_id = EXCLUDED.role_id
    """, nativeQuery = true)
    int assignRoleToUser(long userId, long chatId, long roleId);

}
