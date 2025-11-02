package org.example.identityservice.models.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Entity
@Table(name = "users",
        indexes = {
                @Index(name = "idx_users_email", columnList = "email"),
                @Index(name = "idx_users_id_version", columnList = "id, version")
        }
)
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String password; //Bcrypt

    private boolean enabled = true;

    private Integer version = 0;

    @Column(name="original_avatar_id")
    private Long originalAvatarId;

    @Column(name = "small_avatar_id")
    private Long smallAvatarId;

    @Column(name = "large_avatar_id")
    private Long largeAvatarId;

    @Column(name = "fullscreen_avatar_id")
    private Long fullscreenAvatarId;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    private void setCreatedAt() {
        this.createdAt = Instant.now();
    }

    public void incrementVersion() {
        this.version++;
    }
}






//    @ElementCollection(fetch = FetchType.EAGER)
//    @CollectionTable(id = "user_roles", joinColumns = @JoinColumn(id = "user_id"))
//    @Column(id = "role")
//    private Set<String> roles = new HashSet<>();
