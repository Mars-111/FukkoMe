package ru.kors.chatsservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import ru.kors.chatsservice.controllers.internal.dto.UpdateChatDTO;
import ru.kors.chatsservice.models.entity.Chat;
import ru.kors.chatsservice.models.entity.ChatRole;
import ru.kors.chatsservice.models.entity.projection.ChatInfoProjection;
import ru.kors.chatsservice.repositories.dto.ChatInsertResult;
import ru.kors.chatsservice.repositories.dto.ChatMembersPage;
import ru.kors.chatsservice.repositories.dto.ModifyingAvatarDTO;

import java.util.List;
import java.util.Optional;


public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query(value = """
        SELECT
            id,
            version,
            tag,
            name,
            type,
            description,
            owner_id,
            small_avatar_id,
            large_avatar_id,
            fullscreen_avatar_id,
            default_role_id
        FROM chats
        WHERE id = :id
        LIMIT 1
    """, nativeQuery = true)
    Optional<ChatInfoProjection> findInfoProjectionById(Long id);

    Optional<Chat> findByName(String chatName);

    @Query(value = """
        SELECT
            id,
            version,
            tag,
            name,
            type,
            description,
            owner_id,
            small_avatar_id,
            large_avatar_id,
            fullscreen_avatar_id,
            default_role_id
        FROM chats
        WHERE tag = :tag
        LIMIT 1
    """, nativeQuery = true)
    Optional<ChatInfoProjection> findByTag(String tag);

    @Query(value = """
        SELECT
            id,
            version,
            tag,
            name,
            type,
            description,
            owner_id,
            small_avatar_id,
            large_avatar_id,
            fullscreen_avatar_id,
            default_role_id
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
            description,
            owner_id,
            small_avatar_id,
            large_avatar_id,
            fullscreen_avatar_id,
            default_role_id
        FROM chats
        WHERE tag ILIKE '%' || :q || '%'
        LIMIT :limit
    """, nativeQuery = true)
    List<ChatInfoProjection> findAllLikedTag(@Param("q") String q, @Param("limit") int limit);

    List<ChatInfoProjection> findAllByOwnerId(Long ownerId);

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
        WITH new_chat AS (
         INSERT INTO chats (
             version, tag, name, description, type, owner_id, default_role_id, created_at,
             original_avatar_id, small_avatar_id, large_avatar_id, fullscreen_avatar_id
         )
         VALUES (
             :#{#chat.version}, :#{#chat.tag}, :#{#chat.name}, :#{#chat.description},
             :#{#chat.type.name()}, :#{#chat.ownerId}, NULL, NOW(),
             :#{#chat.originalAvatarId}, :#{#chat.smallAvatarId},
             :#{#chat.largeAvatarId}, :#{#chat.fullscreenAvatarId}
         )
         RETURNING id
     ),

     default_role AS (
         INSERT INTO chat_role (chat_id, name, version, rank, access_flags)
         SELECT
             nc.id,
             :#{#default_role.name},
             :#{#default_role.version},
             :#{#default_role.rank},
             :#{#default_role.accessFlags}
         FROM new_chat nc
         RETURNING id, chat_id
     ),

     set_default AS (
         UPDATE chats c
         SET default_role_id = dr.id
         FROM default_role dr
         WHERE c.id = dr.chat_id
         RETURNING dr.id AS default_role_id, dr.chat_id
     ),

     owner_role AS (
         INSERT INTO chat_role (chat_id, name, version, rank, access_flags)
         SELECT
             nc.id,
             :#{#owner_role.name},
             :#{#owner_role.version},
             :#{#owner_role.rank},
             :#{#owner_role.accessFlags}
         FROM new_chat nc
         RETURNING id, chat_id
     ),

     insert_member AS (
         INSERT INTO chat_members (user_id, chat_id, role_id)
         SELECT
             :#{#chat.ownerId},
             orr.chat_id,
             orr.id
         FROM owner_role orr
     )

     SELECT
         nc.id AS chatId,
         orr.id AS ownerRoleId,
         dr.id AS defaultRoleId
     FROM new_chat nc
     JOIN owner_role orr ON nc.id = orr.chat_id
     JOIN default_role dr ON nc.id = dr.chat_id;
    """, nativeQuery = true)
    ChatInsertResult insertChatWithOwnerRoleAndMapping(
            @Param("chat") Chat chat,
            @Param("owner_role") ChatRole ownerRole,
            @Param("default_role") ChatRole defaultRole
    );



    @Query(value = """
        SELECT EXISTS(
            SELECT 1
            FROM chat_members cm
            WHERE cm.chat_id = :chatId
              AND cm.user_id = :userId
        )
        """, nativeQuery = true)
    boolean isUserInChat(@Param("chatId") Long chatId, @Param("userId") Long userId);


    @Query(value = """
        SELECT 
            c.id,
            c.version,
            c.tag,
            c.name,
            c.type,
            c.description,
            c.owner_id,
            c.small_avatar_id,
            c.large_avatar_id,
            c.fullscreen_avatar_id,
            c.default_role_id
        FROM chats c
        JOIN chat_members m 
            ON m.chat_id = c.id
        WHERE m.user_id = :userId
    """,
        nativeQuery = true)
    List<ChatInfoProjection> findAllByUserId(@Param("userId") Long userId);


    boolean existsByTag(String tag);


    boolean existsByIdAndOwnerId(Long id, Long ownerId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Chat c
        SET c.originalAvatarId = :#{#dto.originalAvatarId},
            c.smallAvatarId = :#{#dto.smallAvatarId},
            c.largeAvatarId = :#{#dto.largeAvatarId},
            c.fullscreenAvatarId = :#{#dto.fullscreenAvatarId},
            c.version = c.version + 1
        WHERE c.id = :userId
            AND (
                c.originalAvatarId <> :#{#dto.originalAvatarId}
                OR c.smallAvatarId <> :#{#dto.smallAvatarId}
                OR c.largeAvatarId <> :#{#dto.largeAvatarId}
                OR c.fullscreenAvatarId <> :#{#dto.fullscreenAvatarId}
            )
    """)
    int updateAvatar(Long userId, @Param("dto") ModifyingAvatarDTO dto);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Chat c
        SET c.name = COALESCE(:#{#updateChatDTO.name}, c.name),
            c.tag = COALESCE(:#{#updateChatDTO.tag}, c.tag),
            c.description = COALESCE(:#{#updateChatDTO.description}, c.description),
            c.version = c.version + 1 
        WHERE c.id = :chatId
    """)
    int update(@Param("chatId") Long chatId,
               @Param("updateChatDTO") UpdateChatDTO dto);

    @Query("SELECT c.version FROM Chat c WHERE c.id = :id")
    Integer findVersionById(Long id);

    @Query(
            value = "select count(user_id) from chat_members where chat_id = :chatId",
            nativeQuery = true
    )
    int getMemberCount(long chatId);


    @Query(
            value = "select user_id from chat_members where chat_id = :chatId",
            nativeQuery = true
    )
    List<Long> getMemberIds(long chatId);

    @Query(value = """
        WITH total_cte AS (
            SELECT COUNT(*) AS total
            FROM chat_members
            WHERE chat_id = :chatId
        ),
        slice AS (
            SELECT user_id
            FROM chat_members
            WHERE chat_id = :chatId
            LIMIT :limit OFFSET :offset
        )
        SELECT
            ARRAY(SELECT user_id FROM slice) AS ids,
            total_cte.total AS total,
            (:offset / :limit + 1) AS currentPage,
            CEIL(total_cte.total::numeric / :limit) AS totalPages
        FROM total_cte
    """,
            nativeQuery = true)
    ChatMembersPage getChatMembersPage(
            @Param("chatId") long chatId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO chat_members (user_id, chat_id, role_id)
        SELECT :userId, c.id, c.default_role_id
        FROM chats c
        WHERE c.id = :chatId
    """, nativeQuery = true)
    void addUserToChat(@Param("chatId") long chatId, @Param("userId") long userId);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM chat_members
        WHERE user_id = :userId
          AND chat_id = :chatId
    """, nativeQuery = true)
    int removeUserFromChat(@Param("chatId") long chatId, @Param("userId") long userId);

    @Query(value = """
        SELECT CASE
            WHEN type = 'PUBLIC_GROUP' OR type = 'PUBLIC_CHANNEL'
            THEN TRUE
            ELSE FALSE
        END
        FROM chats
        WHERE id = :chatId
    """, nativeQuery = true)
    Boolean isPublicChat(@Param("chatId") long chatId);


    @Query(
            value = "select default_role_id from chats where id = :chatId",
            nativeQuery = true
    )
    Long findDefaultRoleId(@Param("chatId") long chatId);

}