package ru.kors.chatsservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.models.entity.projection.ChatInfoProjection;
import ru.kors.chatsservice.repositories.dto.ChatInsertResult;

import java.util.List;
import java.util.Optional;


public interface ChatRepository extends JpaRepository<Chat, Long> {

    Optional<Chat> findByName(String chatName);

    @Query(value = """
        SELECT
            id,
            version,
            tag,
            name,
            type,
            owner_id
        FROM chats
        WHERE tag = :tag
    """, nativeQuery = true)
    Optional<ChatInfoProjection> findByTag(String tag);

    @Query(value = """
        SELECT
            id,
            version,
            tag,
            name,
            type,
            owner_id
        FROM chats
        WHERE name ILIKE '%' || :q || '%'
        LIMIT :limit
    """, nativeQuery = true)
    List<ChatInfoProjection> findAllLikedName(@Param("q") String q, @Param("limit") int limit);

    @Query(value = """
        SELECT
            id,
            version,
            tag,
            name,
            type,
            owner_id
        FROM chats
        WHERE tag ILIKE '%' || :q || '%'
        LIMIT :limit
    """, nativeQuery = true)
    List<ChatInfoProjection> findAllLikedTag(@Param("q") String q, @Param("limit") int limit);

    List<ChatInfoProjection> findAllByOwnerId(Long ownerId);

    @Query("""
        SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
        FROM Chat c
        JOIN c.userIds u
        WHERE c.id = :chatId AND u = :userId
    """)
    boolean existsByIdAndUserId(@Param("chatId") Long chatId,
                                @Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Chat c
        SET c.tag = :tag,
            c.name = :name,
            c.description = :description
        WHERE c.id = :id
    """)
    int updateChat(
            @Param("id") Long id,
            @Param("tag") String tag,
            @Param("name") String name,
            @Param("description") String description
    );

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM Chat c
        WHERE c.id = :id AND c.ownerId = :ownerId
    """)
    int deleteByIdIfCorrectOwnerId(@Param("ownerId") Long ownerIdForVerify, @Param("id") Long id);


    @Query(value = """
        WITH inserted_chat AS (
            INSERT INTO chats (version, tag, name, description, type, owner_id, created_at)
            VALUES (:#{#chat.version}, :#{#chat.tag}, :#{#chat.name}, :#{#chat.description}, :#{#chat.type.name()}, :#{#chat.ownerId}, NOW())
            RETURNING id
        ),
        inserted_role AS (
            INSERT INTO chat_role (chat_id, name, version, rank, access_flags)
            SELECT id, :#{#role.name}, :#{#role.version}, :#{#role.rank}, :#{#role.accessFlags}
            FROM inserted_chat
            RETURNING id AS role_id, chat_id
        )
        INSERT INTO user_role_map (user_id, chat_id, role_id)
        SELECT :#{#chat.ownerId}, chat_id, role_id
        FROM inserted_role
        RETURNING chat_id, role_id;
    """, nativeQuery = true)
    ChatInsertResult insertChatWithOwnerRoleAndMapping(@Param("chat") Chat chat, @Param("role") ChatRole role);

    @Query(value = """
        SELECT EXISTS(
            SELECT 1
            FROM chat_users cu
            WHERE cu.chat_id = :chatId
              AND cu.user_id = :userId
        )
        """, nativeQuery = true)
    boolean isUserInChat(@Param("chatId") Long chatId, @Param("userId") Long userId);


    @Query("""
        SELECT 
            c.id AS id,
            c.version AS version,
            c.tag AS tag,
            c.name AS name,
            CAST(c.type AS string) AS type,
            c.ownerId AS ownerId
        FROM Chat c
        JOIN c.userIds u
        WHERE u = :userId
    """)
    List<ChatInfoProjection> findAllByUserId(@Param("userId") Long userId);

    boolean existsByTag(String tag);
}