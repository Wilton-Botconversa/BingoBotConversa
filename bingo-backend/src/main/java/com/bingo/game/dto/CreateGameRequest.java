package com.bingo.game.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateGameRequest {
    @NotBlank
    private String drawMode; // MANUAL or AUTOMATIC

    @Min(5) @Max(10)
    private int drawIntervalSeconds;
}
