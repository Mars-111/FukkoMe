package ru.kors.chatsservice.models.entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.kors.chatsservice.models.entity.deserializers.ChatDeserializer;
import ru.kors.chatsservice.models.entity.deserializers.ChatRoleDeserializer;
import ru.kors.chatsservice.models.entity.serializers.ChatRoleSerializer;
import ru.kors.chatsservice.models.entity.serializers.ChatSerializer;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@JsonSerialize(using = ChatRoleSerializer.class)
@JsonDeserialize(using = ChatRoleDeserializer.class)
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "chat_role")
public class ChatRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false) //nullable true для default role
    private Chat chat;

    @Column(nullable = false, name = "name")
    private String name;

    private Integer version = 0;

    private Integer rank = 0;

    @Column(name = "access_flags")
    private Long accessFlags;
}


/*
        Long - 64 бит:
        1 - бан
        2 - мут (в будущем придумать как хранить до какого)
        3 - писать сообщения
        4 - отправлять текст
        5 - отправлять файлы
        6 - (оставлю для стикеров)
        7 - ставить реакции
        8 - отвечать на сообщения
        9 - пересылать сообщения
        10 - пинговать кого-либо
        11 - пинговать роли
        12 - пинговать всех
        13 - закреплять сообщения
        14 - удалять свои сообщения
        15 - редактировать свои сообщения
        16 - удалять чужие сообщения
        17 - изменять информацию о чате
        18 - рассматривать заявки на вступление
        19 - банить участников
        20 - мутить участников
        21 - выдавать роли
        22 - создавать роли
        23 -
        24 -
        25 -
        26 -
        27 -
        28 -
        29 -
        30 -
        31 -
        32 -
        33 -
        34 -
        35 -
        36 -
        37 -
        38 -
        39 -
        40 -
        41 -
        42 -
        43 -
        44 -
        45 -
        46 -
        47 -
        48 -
        49 -
        50 -
        51 -
        52 -
        53 -
        54 -
        55 -
        56 -
        57 -
        58 -
        59 -
        60 -
        61 -
        62 -
        63 -
        64 -
    */
