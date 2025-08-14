package ru.kors.storefileservice.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;
import ru.kors.storefileservice.models.File;
import ru.kors.storefileservice.services.dto.FileIsPrivateAndKey;

public interface FileRepository extends ReactiveCrudRepository<File, Long> {

    Mono<File> findByKey(String key);

    @Query("SELECT key FROM files WHERE id = :id")
    Mono<String> findKeyById(@Param("id") Long id);

    @Query("SELECT is_private FROM files WHERE id = :id")
    Mono<Boolean> findIsPrivateById(@Param("id") Long id);

    @Query("SELECT is_private, key FROM files WHERE id = :id")
    Mono<FileIsPrivateAndKey> findIsPrivateAndKeyById(Long id);
}
