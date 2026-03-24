package com.bingo.card.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "card_cells")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CardCell {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private BingoCard card;

    @Column(name = "row_idx", nullable = false)
    private int rowIdx;

    @Column(name = "col_idx", nullable = false)
    private int colIdx;

    @Column(nullable = false)
    private int number;

    @Builder.Default
    private boolean drawn = false;

    @Builder.Default
    private boolean confirmed = false;
}
