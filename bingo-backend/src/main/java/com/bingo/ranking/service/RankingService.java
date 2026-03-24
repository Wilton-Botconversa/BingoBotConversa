package com.bingo.ranking.service;

import com.bingo.card.entity.BingoCard;
import com.bingo.card.repository.BingoCardRepository;
import com.bingo.ranking.dto.RankingDto;
import com.bingo.ranking.entity.Winner;
import com.bingo.ranking.repository.WinnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final WinnerRepository winnerRepository;
    private final BingoCardRepository bingoCardRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void registerWinner(BingoCard card) {
        Long gameId = card.getGame().getId();
        long currentWinners = winnerRepository.countByGameId(gameId);

        if (currentWinners >= 5) return; // Max 5 winners

        int rank = (int) currentWinners + 1;
        LocalDateTime now = LocalDateTime.now();

        card.setCompleted(true);
        card.setCompletedAt(now);
        card.setCompletionRank(rank);
        bingoCardRepository.save(card);

        Winner winner = Winner.builder()
                .game(card.getGame())
                .user(card.getUser())
                .rank(rank)
                .completedAt(now)
                .build();
        winnerRepository.save(winner);

        // Broadcast updated ranking
        List<RankingDto> ranking = getRanking(gameId);
        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/ranking",
                Map.of("winners", ranking));
    }

    public List<RankingDto> getRanking(Long gameId) {
        return winnerRepository.findByGameIdOrderByRankAsc(gameId).stream()
                .map(w -> {
                    RankingDto dto = new RankingDto();
                    dto.setRank(w.getRank());
                    dto.setUserId(w.getUser().getId());
                    dto.setName(w.getUser().getName());
                    dto.setProfilePhotoUrl(w.getUser().getProfilePhotoUrl());
                    dto.setCompletedAt(w.getCompletedAt());
                    return dto;
                })
                .toList();
    }
}
