package com.bingo.participant.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ParticipantDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String profilePhotoUrl;
    private LocalDateTime joinedAt;
}
