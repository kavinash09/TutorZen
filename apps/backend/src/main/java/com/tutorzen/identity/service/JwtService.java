package com.tutorzen.identity.service;

import com.tutorzen.identity.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey key;
    private final long jwtExpirySeconds;
    private final long jwtRefreshExpirySeconds;

    public JwtService(
            @Value("${tutorzen.security.jwt-secret}") String jwtSecret,
            @Value("${tutorzen.security.jwt-expiry-seconds:900}") long jwtExpirySeconds,
            @Value("${tutorzen.security.jwt-refresh-expiry-seconds:604800}") long jwtRefreshExpirySeconds) {
        // Enforce at least 256 bits (32 bytes) for HMAC-SHA256
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters long");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.jwtExpirySeconds = jwtExpirySeconds;
        this.jwtRefreshExpirySeconds = jwtRefreshExpirySeconds;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(jwtExpirySeconds);

        return Jwts.builder()
                .subject(user.getId())
                .claim("tenantId", user.getTenantId())
                .claim("email", user.getEmail())
                .claim("fullName", user.getFullName())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public Optional<Claims> parseAndValidateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public long getAccessTokenExpirySeconds() {
        return jwtExpirySeconds;
    }

    public long getRefreshTokenExpirySeconds() {
        return jwtRefreshExpirySeconds;
    }
}

