package com.bingo.user.controller;

import com.bingo.user.dto.UserProfileDto;
import com.bingo.user.entity.Role;
import com.bingo.user.entity.User;
import com.bingo.user.repository.UserRepository;
import com.bingo.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        List<UserProfileDto> users = userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/{userId}/toggle-admin")
    public ResponseEntity<UserProfileDto> toggleAdmin(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        if (user.getRole() == Role.ADMIN) {
            user.setRole(Role.USER);
        } else {
            user.setRole(Role.ADMIN);
        }

        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    private UserProfileDto toDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setRole(user.getRole().name());
        return dto;
    }
}
