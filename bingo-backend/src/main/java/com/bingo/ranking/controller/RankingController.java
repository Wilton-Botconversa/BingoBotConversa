package com.bingo.ranking.controller;

import com.bingo.ranking.dto.RankingDto;
import com.bingo.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games/{gameId}/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping
    public ResponseEntity<List<RankingDto>> getRanking(@PathVariable Long gameId) {
        return ResponseEntity.ok(rankingService.getRanking(gameId));
    }
}
