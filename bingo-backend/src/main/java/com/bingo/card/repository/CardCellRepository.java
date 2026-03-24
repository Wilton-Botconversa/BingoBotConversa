package com.bingo.card.repository;

import com.bingo.card.entity.CardCell;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CardCellRepository extends JpaRepository<CardCell, Long> {
    List<CardCell> findByCardGameIdAndNumber(Long gameId, int number);
    long countByCardIdAndConfirmedTrue(Long cardId);
}
