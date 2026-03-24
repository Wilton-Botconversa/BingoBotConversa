package com.bingo.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@Slf4j
public class BotconversaClient {

    private final RestClient restClient;

    public BotconversaClient(
            @Value("${botconversa.base-url}") String baseUrl,
            @Value("${botconversa.api-key}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String createSubscriber(String phone, String firstName) {
        try {
            var body = Map.of(
                    "phone", phone,
                    "first_name", firstName,
                    "has_opt_in_whatsapp", true
            );

            var response = restClient.post()
                    .uri("/subscriber/")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("id")) {
                String subscriberId = response.get("id").toString();
                log.info("Subscriber criado no Botconversa: {}", subscriberId);
                return subscriberId;
            }
            return null;
        } catch (Exception e) {
            log.warn("Falha ao criar subscriber no Botconversa: {}", e.getMessage());
            return null;
        }
    }

    public void sendMessage(String subscriberId, String message) {
        try {
            var body = Map.of("message", message);

            restClient.post()
                    .uri("/subscriber/{id}/send_message/", subscriberId)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Mensagem enviada via Botconversa para subscriber: {}", subscriberId);
        } catch (Exception e) {
            log.warn("Falha ao enviar mensagem via Botconversa: {}", e.getMessage());
        }
    }
}
