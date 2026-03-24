package com.bingo.ranking.repository;

import com.bingo.ranking.entity.Winner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WinnerRepository extends JpaRepository<Winner, Long> {
    List<Winner> findByGameIdOrderByRankAsc(Long gameId);
    long countByGameId(Long gameId);
}
