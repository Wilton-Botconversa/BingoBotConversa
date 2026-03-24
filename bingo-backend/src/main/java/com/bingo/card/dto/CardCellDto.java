package com.bingo.card.dto;

import lombok.Data;

@Data
public class CardCellDto {
    private Long id;
    private int rowIdx;
    private int colIdx;
    private int number;
    private boolean drawn;
    private boolean confirmed;
}
