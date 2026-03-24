package com.bingo.card.repository;

import com.bingo.card.entity.BingoCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BingoCardRepository extends JpaRepository<BingoCard, Long> {
    Optional<BingoCard> findByGameIdAndUserId(Long gameId, Long userId);
    List<BingoCard> findByGameId(Long gameId);
}
