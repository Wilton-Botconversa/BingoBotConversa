package com.bingo.card.dto;

import lombok.Data;
import java.util.List;

@Data
public class BingoCardDto {
    private Long id;
    private Long gameId;
    private String userName;
    private boolean completed;
    private Integer completionRank;
    private List<CardCellDto> cells;
}
