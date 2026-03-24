package com.bingo.ranking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RankingDto {
    private int rank;
    private Long userId;
    private String name;
    private String profilePhotoUrl;
    private LocalDateTime completedAt;
}
