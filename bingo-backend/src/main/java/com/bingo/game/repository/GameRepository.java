package com.bingo.game.repository;

import com.bingo.game.entity.Game;
import com.bingo.game.entity.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {
    Optional<Game> findByStatus(GameStatus status);
    List<Game> findByStatusIn(List<GameStatus> statuses);
}
