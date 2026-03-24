package com.bingo.game.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GameDto {
    private Long id;
    private String status;
    private String drawMode;
    private int drawIntervalSeconds;
    private List<Integer> drawnNumbers;
    private int participantCount;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}
