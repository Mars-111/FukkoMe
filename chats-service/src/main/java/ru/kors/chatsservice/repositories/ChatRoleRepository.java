package ru.kors.chatsservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.repositories.dto.ChatMembersPage;
import ru.kors.chatsservice.repositories.dto.UserRolePairProjection;

import java.util.List;

public interface ChatRoleRepository extends JpaRepository<ChatRole, Long> {
    @Query(
        value = """
            SELECT 
                urm.user_id AS userId,
                urm.role_id AS roleId
            FROM user_role_map urm
            JOIN chat_role cr ON cr.id = urm.role_id
            WHERE cr.chat_id = :chatId
            ORDER BY cr.rank DESC
            LIMIT :limit
        """,
        nativeQuery = true
    )
    List<UserRolePairProjection> findTopRoleMembers(
            @Param("chatId") Long chatId,
            @Param("limit") Integer limit
    );

    @Query(value = """
        SELECT role.version
        FROM chat_role role
        WHERE role.chat_id = :chatId
    """, nativeQuery = true)
    Integer findVersionById(Long id);
}
