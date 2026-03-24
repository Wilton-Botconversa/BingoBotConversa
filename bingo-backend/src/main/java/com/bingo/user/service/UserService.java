package com.bingo.user.service;

import com.bingo.user.dto.UpdateProfileRequest;
import com.bingo.user.dto.UserProfileDto;
import com.bingo.user.entity.User;
import com.bingo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return toDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email já cadastrado");
            }
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserProfileDto updateProfilePhoto(String email, String photoUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        user.setProfilePhotoUrl(photoUrl);
        userRepository.save(user);
        return toDto(user);
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
