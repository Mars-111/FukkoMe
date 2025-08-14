package org.example.identityservice.repositories;

import org.example.identityservice.models.UserIdAndPassword;
import org.example.identityservice.models.UserInfo;
import org.example.identityservice.models.entity.User;
import org.example.identityservice.repositories.dto.UserUpdateFields;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
              u.avatarId AS avatarId,
              u.createdAt AS createdAt,
              u.version AS version
       FROM User u
       WHERE u.id = ?1
       """)
    Optional<UserInfo> findInfoById(Long id);

    boolean existsByIdAndVersion(Long id, Integer version);

    @Query("SELECT u.version FROM User u WHERE u.id = :userId")
    Optional<Integer> getVersionById(Long userId);

    @Modifying
    @Query("""
        UPDATE User u
        SET 
            u.username = COALESCE(:#{#dto.username}, u.username),
            u.avatarId = COALESCE(:#{#dto.avatarId}, u.avatarId),
            u.version = u.version + 1
        WHERE u.id = :#{#dto.userId}
          AND (
              (:#{#dto.username} IS NOT NULL AND :#{#dto.username} <> u.username)
              OR (:#{#dto.avatarId} IS NOT NULL AND (u.avatarId IS NULL OR :#{#dto.avatarId} <> u.avatarId))
          )
    """)
    int update(@Param("dto") UserUpdateFields dto);

    @Query(value = """
    UPDATE users u
    SET 
        username = COALESCE(:#{#dto.username}, username),
        avatar_id = COALESCE(:#{#dto.avatarId}, avatar_id),
        version = version + 1
    WHERE id = :#{#dto.userId}
      AND (
          (:#{#dto.username} IS NOT NULL AND :#{#dto.username} <> username)
          OR (:#{#dto.avatarId} IS NOT NULL AND (avatar_id IS NULL OR :#{#dto.avatarId} <> avatar_id))
      )
    RETURNING version
    """, nativeQuery = true)
    Integer updateAndReturnVersion(@Param("dto") UserUpdateFields dto);


    @Query(value = """
    UPDATE users u
    SET 
        username = COALESCE(:#{#dto.username}, username),
        avatar_id = COALESCE(:#{#dto.avatarId}, avatar_id),
        version = version + 1
    WHERE id = :#{#dto.userId}
      AND (
          (CAST(:#{#dto.username} AS text) IS NOT NULL AND :#{#dto.username} <> username)
          OR (CAST(:#{#dto.avatarId} AS bigint) IS NOT NULL AND (avatar_id IS NULL OR :#{#dto.avatarId} <> avatar_id))
      )
    RETURNING *
    """, nativeQuery = true)
    User updateAndReturnUser(@Param("dto") UserUpdateFields dto);




}
