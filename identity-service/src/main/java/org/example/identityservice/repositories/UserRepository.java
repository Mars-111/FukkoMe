package org.example.identityservice.repositories;

import org.example.identityservice.controllers.extern.dto.UpdateUserDTO;
import org.example.identityservice.models.entity.projection.UserIdAndPassword;
import org.example.identityservice.models.entity.projection.UserProfileProjection;
import org.example.identityservice.models.entity.User;
import org.example.identityservice.repositories.dto.ModifyingAvatarDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsernameAndPassword(String username, String password);
    boolean existsByEmailAndPassword(String email, String password);

    @Query("SELECT u.id AS id, u.password AS password FROM User u WHERE u.username = ?1")
    Optional<UserIdAndPassword> findIdAndPasswordByUsername(String username);
    @Query("SELECT u.id AS id, u.password AS password FROM User u WHERE u.email = ?1")
    Optional<UserIdAndPassword> findIdAndPasswordByEmail(String email);

    @Query("""
       SELECT u.id AS id,
              u.username AS username,
              u.enabled AS enabled,
              u.smallAvatarId AS smallAvatarId,
              u.largeAvatarId  AS largeAvatarId,
              u.fullscreenAvatarId  AS fullscreenAvatarId,  
              u.version AS version
       FROM User u
       WHERE u.id = ?1
       """)
    Optional<UserProfileProjection> findUserProfileById(Long id);

    boolean existsByIdAndVersion(Long id, Integer version);

    @Query("SELECT u.version FROM User u WHERE u.id = :userId")
    Optional<Integer> getVersionById(Long userId);

    @Modifying
    @Query("""
        UPDATE User u
        SET u.username = :#{#dto.username},
            u.version = u.version + 1
        WHERE u.id = :userId
        AND u.username <> :#{#dto.username}
    """)
    int update(Long userId, @Param("dto") UpdateUserDTO dto);

    @Modifying
    @Query("""
        UPDATE User u
        SET u.originalAvatarId = :#{#dto.originalAvatarId},
            u.smallAvatarId = :#{#dto.smallAvatarId},
            u.largeAvatarId = :#{#dto.largeAvatarId},
            u.fullscreenAvatarId = :#{#dto.fullscreenAvatarId},
            u.version = u.version + 1
        WHERE u.id = :userId
            AND (
                u.originalAvatarId <> :#{#dto.originalAvatarId}
                OR u.smallAvatarId <> :#{#dto.smallAvatarId}
                OR u.largeAvatarId <> :#{#dto.largeAvatarId}
                OR u.fullscreenAvatarId <> :#{#dto.fullscreenAvatarId}
            )
    """)
    int updateAvatar(Long userId, @Param("dto") ModifyingAvatarDTO dto);


    @Query("""
        SELECT CASE WHEN u.enabled = true THEN true ELSE false END
        FROM User u
        WHERE u.id = :userId
    """)
    boolean isEnabled(@Param("userId") Long userId);

    @Query("""
        SELECT u.createdAt
        FROM User u
        WHERE u.id = :id
    """)
    Instant findUserCreatedAt(Long id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query(value = """
        SELECT id,
               username,
               enabled,
               small_avatar_id,
               large_avatar_id,
               fullscreen_avatar_id,
               version
        FROM users
        WHERE username ILIKE '%' || :q || '%'
        LIMIT :limit
    """, nativeQuery = true)
    List<UserProfileProjection> likeUsername(@Param("q") String q, @Param("limit") int limit);
}