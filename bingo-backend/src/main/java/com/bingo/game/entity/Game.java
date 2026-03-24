package com.bingo.game.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "games")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameStatus status;

    @Column(nullable = false)
    private String drawMode;

    private int drawIntervalSeconds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "drawn_numbers", columnDefinition = "int[]")
    @Builder.Default
    private List<Integer> drawnNumbers = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = GameStatus.PENDING;
        if (drawMode == null) drawMode = "MANUAL";
        if (drawIntervalSeconds == 0) drawIntervalSeconds = 5;
    }
}
