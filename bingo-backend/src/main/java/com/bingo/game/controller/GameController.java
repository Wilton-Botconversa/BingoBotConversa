package com.bingo.game.controller;

import com.bingo.game.dto.GameDto;
import com.bingo.game.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("/active")
    public ResponseEntity<GameDto> getActiveGame() {
        GameDto game = gameService.getActiveGame();
        return ResponseEntity.ok(game);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDto> getGame(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGame(id));
    }
}
