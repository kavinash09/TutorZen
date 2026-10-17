package com.tutorzen.attendance.api.dto;

public record GeneratedPinResponse(
    String sessionId,
    String code,
    long expiresInSeconds,
    String qrPayload
) {
}

