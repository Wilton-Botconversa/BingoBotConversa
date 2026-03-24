package com.bingo.participant.controller;

import com.bingo.participant.dto.ParticipantDto;
import com.bingo.participant.service.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games/{gameId}")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping("/participants")
    public ResponseEntity<List<ParticipantDto>> getParticipants(@PathVariable Long gameId) {
        return ResponseEntity.ok(participantService.getParticipants(gameId));
    }

    @PostMapping("/join")
    public ResponseEntity<ParticipantDto> joinGame(@PathVariable Long gameId, Authentication auth) {
        return ResponseEntity.ok(participantService.joinGame(gameId, auth.getName()));
    }

    @GetMapping("/my-participation")
    public ResponseEntity<Map<String, Boolean>> checkParticipation(@PathVariable Long gameId, Authentication auth) {
        boolean isParticipant = participantService.isParticipant(gameId, auth.getName());
        return ResponseEntity.ok(Map.of("participating", isParticipant));
    }
}
