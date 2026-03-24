package com.bingo.participant.repository;

import com.bingo.participant.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByGameId(Long gameId);
    boolean existsByGameIdAndUserId(Long gameId, Long userId);
    long countByGameId(Long gameId);
}
