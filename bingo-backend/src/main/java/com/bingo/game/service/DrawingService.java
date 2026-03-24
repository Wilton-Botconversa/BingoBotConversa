package com.bingo.game.service;

import com.bingo.card.entity.BingoCard;
import com.bingo.card.entity.CardCell;
import com.bingo.card.repository.BingoCardRepository;
import com.bingo.card.repository.CardCellRepository;
import com.bingo.card.service.CardGenerationService;
import com.bingo.game.entity.Game;
import com.bingo.game.entity.GameStatus;
import com.bingo.game.repository.GameRepository;
import com.bingo.integration.BotconversaClient;
import com.bingo.participant.entity.Participant;
import com.bingo.participant.repository.ParticipantRepository;
import com.bingo.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DrawingService {

    private final GameRepository gameRepository;
    private final ParticipantRepository participantRepository;
    private final BingoCardRepository bingoCardRepository;
    private final CardCellRepository cardCellRepository;
    private final CardGenerationService cardGenerationService;
    private final BotconversaClient botconversaClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;

    @Value("${app.cors.allowed-origins}")
    private String appUrl;

    private final Map<Long, ScheduledFuture<?>> autoDrawTasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    @Transactional
    public Map<String, Object> startGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));

        if (game.getStatus() != GameStatus.PENDING) {
            throw new IllegalArgumentException("Jogo já foi iniciado");
        }

        List<Participant> participants = participantRepository.findByGameId(gameId);
        if (participants.isEmpty()) {
            throw new IllegalArgumentException("Nenhum participante no jogo");
        }

        // Generate cards for all participants
        for (Participant p : participants) {
            cardGenerationService.generateCard(game, p.getUser());
        }

        game.setStatus(GameStatus.ACTIVE);
        game.setStartedAt(LocalDateTime.now());
        gameRepository.save(game);

        // Send WhatsApp messages (async, best-effort)
        for (Participant p : participants) {
            User user = p.getUser();
            if (user.getPhone() != null && !user.getPhone().isBlank()) {
                try {
                    String link = appUrl + "/tabelas";
                    botconversaClient.sendMessage(user.getPhone(),
                            "Seu Bingo começou! Acesse sua cartela: " + link);
                } catch (Exception e) {
                    log.warn("Falha ao enviar WhatsApp para {}: {}", user.getName(), e.getMessage());
                }
            }
        }

        // Broadcast game started
        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/status",
                Map.of("status", "ACTIVE", "message", "Jogo iniciado!"));

        // Start auto-draw if automatic mode
        if ("AUTOMATIC".equals(game.getDrawMode())) {
            startAutoDraw(game);
        }

        return Map.of("status", "ACTIVE", "participantCount", participants.size());
    }

    @Transactional
    public Map<String, Object> drawNumber(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));

        if (game.getStatus() != GameStatus.ACTIVE) {
            throw new IllegalArgumentException("Jogo não está ativo");
        }

        List<Integer> drawn = game.getDrawnNumbers();
        if (drawn == null) drawn = new ArrayList<>();

        Set<Integer> drawnSet = new HashSet<>(drawn);
        List<Integer> remaining = new ArrayList<>();
        for (int i = 1; i <= 75; i++) {
            if (!drawnSet.contains(i)) remaining.add(i);
        }

        if (remaining.isEmpty()) {
            game.setStatus(GameStatus.FINISHED);
            game.setFinishedAt(LocalDateTime.now());
            gameRepository.save(game);
            stopAutoDraw(gameId);
            messagingTemplate.convertAndSend("/topic/game/" + gameId + "/status",
                    Map.of("status", "FINISHED", "message", "Todos os números foram sorteados!"));
            return Map.of("finished", true);
        }

        Collections.shuffle(remaining);
        int number = remaining.get(0);

        drawn.add(number);
        game.setDrawnNumbers(new ArrayList<>(drawn));
        gameRepository.save(game);

        // Mark cells as drawn
        List<CardCell> cells = cardCellRepository.findByCardGameIdAndNumber(gameId, number);
        for (CardCell cell : cells) {
            cell.setDrawn(true);
        }
        cardCellRepository.saveAll(cells);

        // Broadcast the drawn number
        Map<String, Object> event = Map.of(
                "number", number,
                "drawnNumbers", drawn,
                "totalDrawn", drawn.size(),
                "remaining", 75 - drawn.size()
        );
        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/draw", event);

        return event;
    }

    @Transactional
    public void pauseGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));

        if (game.getStatus() != GameStatus.ACTIVE) {
            throw new IllegalArgumentException("Jogo não está ativo");
        }

        game.setStatus(GameStatus.PAUSED);
        gameRepository.save(game);
        stopAutoDraw(gameId);

        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/status",
                Map.of("status", "PAUSED", "message", "Jogo pausado"));
    }

    @Transactional
    public void resumeGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));

        if (game.getStatus() != GameStatus.PAUSED) {
            throw new IllegalArgumentException("Jogo não está pausado");
        }

        game.setStatus(GameStatus.ACTIVE);
        gameRepository.save(game);

        if ("AUTOMATIC".equals(game.getDrawMode())) {
            startAutoDraw(game);
        }

        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/status",
                Map.of("status", "ACTIVE", "message", "Jogo retomado"));
    }

    private void startAutoDraw(Game game) {
        stopAutoDraw(game.getId());
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                drawNumber(game.getId());
            } catch (Exception e) {
                log.error("Erro no sorteio automático: {}", e.getMessage());
                stopAutoDraw(game.getId());
            }
        }, game.getDrawIntervalSeconds(), game.getDrawIntervalSeconds(), TimeUnit.SECONDS);
        autoDrawTasks.put(game.getId(), future);
    }

    private void stopAutoDraw(Long gameId) {
        ScheduledFuture<?> future = autoDrawTasks.remove(gameId);
        if (future != null) {
            future.cancel(false);
        }
    }
}
