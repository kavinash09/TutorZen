package com.tutorzen.identity.dto;

import com.tutorzen.identity.domain.UserRole;

public record UserProfileDto(
    String id,
    String tenantId,
    String email,
    String fullName,
    UserRole role
) {
}

