package ru.kors.chatsservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimelineService {

    private final RestClient restClient = RestClient.builder().build();;

    @Value("${master.timeline.url}")
    private String url;
    @Value("${master.timeline.user}")
    private String user;
    @Value("${master.timeline.password}")
    private String password;

    public Integer getNextOrderId(Long chatId) {
        String basicAuth = Base64.getEncoder().encodeToString((user + ":" + password).getBytes(StandardCharsets.UTF_8));
        Integer nextOrderId = restClient.get()
                .uri(url + "/api/chat/" + chatId + "/next")
                .header(HttpHeaders.AUTHORIZATION, "Basic " + basicAuth)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(Integer.class);
        log.info("Next Order Id: {}", nextOrderId);
        return nextOrderId;
    }


}
