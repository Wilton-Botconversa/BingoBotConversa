package com.bingo.card.service;

import com.bingo.card.entity.BingoCard;
import com.bingo.card.entity.CardCell;
import com.bingo.card.repository.BingoCardRepository;
import com.bingo.game.entity.Game;
import com.bingo.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CardGenerationService {

    private final BingoCardRepository bingoCardRepository;

    private static final int[][] COLUMN_RANGES = {
            {1, 15},   // B
            {16, 30},  // I
            {31, 45},  // N
            {46, 60},  // G
            {61, 75}   // O
    };

    @Transactional
    public BingoCard generateCard(Game game, User user) {
        BingoCard card = BingoCard.builder()
                .game(game)
                .user(user)
                .build();

        Random random = new Random();
        Set<String> existingCards = getExistingCardSignatures(game.getId());
        List<int[]> columns;
        String signature;

        do {
            columns = new ArrayList<>();
            for (int[] range : COLUMN_RANGES) {
                columns.add(pickNumbers(range[0], range[1], 5, random));
            }
            signature = generateSignature(columns);
        } while (existingCards.contains(signature));

        List<CardCell> cells = new ArrayList<>();
        for (int col = 0; col < 5; col++) {
            int[] numbers = columns.get(col);
            Arrays.sort(numbers);
            for (int row = 0; row < 5; row++) {
                CardCell cell = CardCell.builder()
                        .card(card)
                        .rowIdx(row)
                        .colIdx(col)
                        .number(numbers[row])
                        .build();
                cells.add(cell);
            }
        }

        card.setCells(cells);
        return bingoCardRepository.save(card);
    }

    private int[] pickNumbers(int min, int max, int count, Random random) {
        List<Integer> pool = new ArrayList<>();
        for (int i = min; i <= max; i++) pool.add(i);
        Collections.shuffle(pool, random);
        return pool.subList(0, count).stream().mapToInt(Integer::intValue).toArray();
    }

    private Set<String> getExistingCardSignatures(Long gameId) {
        Set<String> signatures = new HashSet<>();
        List<BingoCard> existing = bingoCardRepository.findByGameId(gameId);
        for (BingoCard card : existing) {
            List<int[]> columns = new ArrayList<>();
            for (int col = 0; col < 5; col++) {
                final int c = col;
                int[] nums = card.getCells().stream()
                        .filter(cell -> cell.getColIdx() == c)
                        .sorted(Comparator.comparingInt(CardCell::getRowIdx))
                        .mapToInt(CardCell::getNumber)
                        .toArray();
                columns.add(nums);
            }
            signatures.add(generateSignature(columns));
        }
        return signatures;
    }

    private String generateSignature(List<int[]> columns) {
        StringBuilder sb = new StringBuilder();
        for (int[] col : columns) {
            int[] sorted = col.clone();
            Arrays.sort(sorted);
            for (int n : sorted) {
                sb.append(n).append(",");
            }
            sb.append("|");
        }
        return sb.toString();
    }
}
