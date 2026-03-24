package com.bingo.participant.service;

import com.bingo.game.entity.Game;
import com.bingo.game.entity.GameStatus;
import com.bingo.game.repository.GameRepository;
import com.bingo.participant.dto.ParticipantDto;
import com.bingo.participant.entity.Participant;
import com.bingo.participant.repository.ParticipantRepository;
import com.bingo.user.entity.User;
import com.bingo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    public List<ParticipantDto> getParticipants(Long gameId) {
        return participantRepository.findByGameId(gameId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ParticipantDto joinGame(Long gameId, String userEmail) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Jogo não encontrado"));

        if (game.getStatus() != GameStatus.PENDING) {
            throw new IllegalArgumentException("Só é possível entrar em jogos pendentes");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        if (participantRepository.existsByGameIdAndUserId(gameId, user.getId())) {
            throw new IllegalArgumentException("Você já está participando deste jogo");
        }

        Participant participant = Participant.builder()
                .game(game)
                .user(user)
                .build();

        participantRepository.save(participant);
        return toDto(participant);
    }

    public boolean isParticipant(Long gameId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return false;
        return participantRepository.existsByGameIdAndUserId(gameId, user.getId());
    }

    private ParticipantDto toDto(Participant p) {
        ParticipantDto dto = new ParticipantDto();
        dto.setId(p.getId());
        dto.setUserId(p.getUser().getId());
        dto.setName(p.getUser().getName());
        dto.setEmail(p.getUser().getEmail());
        dto.setProfilePhotoUrl(p.getUser().getProfilePhotoUrl());
        dto.setJoinedAt(p.getJoinedAt());
        return dto;
    }
}
