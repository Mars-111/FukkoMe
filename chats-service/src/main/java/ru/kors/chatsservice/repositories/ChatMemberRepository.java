package ru.kors.chatsservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.models.entity.ChatMember;
import ru.kors.chatsservice.models.entity.embeddable.ChatMemberId;
import ru.kors.chatsservice.models.entity.projection.ChatMemberInfo;
import ru.kors.chatsservice.repositories.dto.AccessFlagsAndRankDTO;

import java.util.List;
import java.util.Optional;

public interface ChatMemberRepository extends JpaRepository<ChatMember, ChatMemberId> {

    @Query(value = """
        SELECT r.*
        FROM chat_members ucrm
        JOIN chat_role r ON ucrm.role_id = r.id
        WHERE ucrm.user_id = :userId
          AND ucrm.chat_id = :chatId
          AND r.chat_id = :chatId
        LIMIT 1
    """, nativeQuery = true)
    Optional<ChatRole> findUserChatRole(long userId, long chatId);

    @Query("""
        SELECT r.accessFlags AS accessFlag, r.rank AS rank
        FROM ChatMember ucrm
        JOIN ChatRole r ON ucrm.roleId = r.id
        WHERE ucrm.id.userId = :userId
          AND ucrm.id.chatId = :chatId
          AND r.chat.id = :chatId
    """)
    Optional<AccessFlagsAndRankDTO> findRoleAccessFlagsAndRankByUserIdAndChatId(long userId, long chatId);

    @Query("""
        SELECT r.accessFlags
        FROM ChatMember ucrm
        JOIN ChatRole r ON ucrm.roleId = r.id
        WHERE ucrm.id.userId = :userId
          AND ucrm.id.chatId = :chatId
          AND r.chat.id = :chatId
    """)
    Optional<Long> findRoleAccessFlagsByUserIdAndChatId(@Param("userId") long userId, @Param("chatId") long chatId);

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO chat_members (user_id, chat_id, role_id)
        VALUES (:userId, :chatId, :roleId)
        ON CONFLICT (user_id, chat_id)
        DO UPDATE SET role_id = EXCLUDED.role_id
    """, nativeQuery = true)
    int assignUserAndRoleToChatMembers(long chatId, long userId, long roleId);

    @Query(
            value = """
            SELECT 
                user_id AS userId,
                role_id AS roleId
            FROM chat_members
            WHERE chat_id = :chatId
            """,
            nativeQuery = true
    )
    List<ChatMemberInfo> findUserIdsAndRolesByChatId(@Param("chatId") Long chatId);



    @Query(
            value = "SELECT chat_id FROM chat_members WHERE user_id = :userId",
            nativeQuery = true
    )
    List<Long> findAllChatIdsByUserId(@Param("userId") Long userId);
}
