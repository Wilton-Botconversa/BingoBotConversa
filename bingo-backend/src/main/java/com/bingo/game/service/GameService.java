package com.bingo.game.service;

import com.bingo.game.dto.CreateGameRequest;
import com.bingo.game.dto.GameDto;
import com.bingo.game.entity.Game;
import com.bingo.game.entity.GameStatus;
import com.bingo.game.repository.GameRepository;
import com.bingo.participant.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final ParticipantRepository participantRepository;

    @Transactional
    public GameDto createGame(CreateGameRequest request) {
        // Only one active/pending game at a time
        List<Game> activeGames = gameRepository.findByStatusIn(
                List.of(GameStatus.PENDING, GameStatus.ACTIVE, GameStatus.PAUSED));
        if (!activeGames.isEmpty()) {
            throw new IllegalArgumentException("Já existe um jogo ativo ou pendente");
        }

        Game game = Game.builder()
                .status(GameStatus.PENDING)
                .drawMode(request.getDrawMode())
                .drawIntervalSeconds(request.getDrawIntervalSeconds())
                .build();

        gameRepository.save(game);
        return toDto(game);
    }

    public GameDto getActiveGame() {
        return gameRepository.findByStatusIn(
                        List.of(GameStatus.PENDING, GameStatus.ACTIVE, GameStatus.PAUSED))
                .stream()
                .findFirst()
                .map(this::toDto)
                .orElse(null);
    }

    public GameDto getGame(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));
        return toDto(game);
    }

    @Transactional
    public GameDto finishGame(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));
        game.setStatus(GameStatus.FINISHED);
        game.setFinishedAt(LocalDateTime.now());
        gameRepository.save(game);
        return toDto(game);
    }

    public Game getGameEntity(Long id) {
        return gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));
    }

    public GameDto toDto(Game game) {
        GameDto dto = new GameDto();
        dto.setId(game.getId());
        dto.setStatus(game.getStatus().name());
        dto.setDrawMode(game.getDrawMode());
        dto.setDrawIntervalSeconds(game.getDrawIntervalSeconds());
        dto.setDrawnNumbers(game.getDrawnNumbers());
        dto.setParticipantCount((int) participantRepository.countByGameId(game.getId()));
        dto.setCreatedAt(game.getCreatedAt());
        dto.setStartedAt(game.getStartedAt());
        dto.setFinishedAt(game.getFinishedAt());
        return dto;
    }
}
