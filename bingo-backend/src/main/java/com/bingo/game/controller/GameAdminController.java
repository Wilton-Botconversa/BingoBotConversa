package com.bingo.game.controller;

import com.bingo.game.dto.CreateGameRequest;
import com.bingo.game.dto.GameDto;
import com.bingo.game.service.DrawingService;
import com.bingo.game.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/games")
@RequiredArgsConstructor
public class GameAdminController {

    private final GameService gameService;
    private final DrawingService drawingService;

    @PostMapping
    public ResponseEntity<GameDto> createGame(@Valid @RequestBody CreateGameRequest request) {
        return ResponseEntity.ok(gameService.createGame(request));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Map<String, Object>> startGame(@PathVariable Long id) {
        return ResponseEntity.ok(drawingService.startGame(id));
    }

    @PostMapping("/{id}/draw")
    public ResponseEntity<Map<String, Object>> drawNumber(@PathVariable Long id) {
        return ResponseEntity.ok(drawingService.drawNumber(id));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<Void> pauseGame(@PathVariable Long id) {
        drawingService.pauseGame(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<Void> resumeGame(@PathVariable Long id) {
        drawingService.resumeGame(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<GameDto> finishGame(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.finishGame(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDto> getGame(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGame(id));
    }
}
