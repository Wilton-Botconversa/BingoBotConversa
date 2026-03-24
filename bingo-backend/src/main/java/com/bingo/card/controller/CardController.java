package com.bingo.card.controller;

import com.bingo.card.dto.BingoCardDto;
import com.bingo.card.dto.CardCellDto;
import com.bingo.card.entity.BingoCard;
import com.bingo.card.entity.CardCell;
import com.bingo.card.repository.BingoCardRepository;
import com.bingo.card.repository.CardCellRepository;
import com.bingo.ranking.service.RankingService;
import com.bingo.user.entity.User;
import com.bingo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CardController {

    private final BingoCardRepository bingoCardRepository;
    private final CardCellRepository cardCellRepository;
    private final UserRepository userRepository;
    private final RankingService rankingService;

    @GetMapping("/games/{gameId}/my-card")
    public ResponseEntity<BingoCardDto> getMyCard(@PathVariable Long gameId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        BingoCard card = bingoCardRepository.findByGameIdAndUserId(gameId, user.getId())
                .orElse(null);

        if (card == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(toDto(card));
    }

    @PostMapping("/cards/{cardId}/confirm/{cellId}")
    public ResponseEntity<Map<String, Object>> confirmCell(
            @PathVariable Long cardId,
            @PathVariable Long cellId,
            Authentication auth) {

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        BingoCard card = bingoCardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Cartela não encontrada"));

        if (!card.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Esta cartela não pertence a você");
        }

        CardCell cell = cardCellRepository.findById(cellId)
                .orElseThrow(() -> new IllegalArgumentException("Célula não encontrada"));

        if (!cell.getCard().getId().equals(cardId)) {
            throw new IllegalArgumentException("Célula não pertence a esta cartela");
        }

        if (!cell.isDrawn()) {
            throw new IllegalArgumentException("Este número ainda não foi sorteado");
        }

        if (cell.isConfirmed()) {
            return ResponseEntity.ok(Map.of("confirmed", true, "alreadyConfirmed", true));
        }

        cell.setConfirmed(true);
        cardCellRepository.save(cell);

        // Check if card is complete
        long confirmedCount = cardCellRepository.countByCardIdAndConfirmedTrue(cardId);
        boolean isComplete = confirmedCount == 25;

        if (isComplete && !card.isCompleted()) {
            rankingService.registerWinner(card);
        }

        return ResponseEntity.ok(Map.of(
                "confirmed", true,
                "complete", isComplete,
                "confirmedCount", confirmedCount
        ));
    }

    private BingoCardDto toDto(BingoCard card) {
        BingoCardDto dto = new BingoCardDto();
        dto.setId(card.getId());
        dto.setGameId(card.getGame().getId());
        dto.setUserName(card.getUser().getName());
        dto.setCompleted(card.isCompleted());
        dto.setCompletionRank(card.getCompletionRank());
        dto.setCells(card.getCells().stream()
                .sorted(Comparator.comparingInt(CardCell::getColIdx)
                        .thenComparingInt(CardCell::getRowIdx))
                .map(this::toCellDto)
                .toList());
        return dto;
    }

    private CardCellDto toCellDto(CardCell cell) {
        CardCellDto dto = new CardCellDto();
        dto.setId(cell.getId());
        dto.setRowIdx(cell.getRowIdx());
        dto.setColIdx(cell.getColIdx());
        dto.setNumber(cell.getNumber());
        dto.setDrawn(cell.isDrawn());
        dto.setConfirmed(cell.isConfirmed());
        return dto;
    }
}
