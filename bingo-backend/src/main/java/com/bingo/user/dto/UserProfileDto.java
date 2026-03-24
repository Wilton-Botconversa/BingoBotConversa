package com.bingo.user.dto;

import lombok.Data;

@Data
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profilePhotoUrl;
    private String role;
}
