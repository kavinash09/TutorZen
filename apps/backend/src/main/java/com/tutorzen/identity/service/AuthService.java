package com.tutorzen.identity.service;

import com.tutorzen.identity.domain.RefreshToken;
import com.tutorzen.identity.domain.User;
import com.tutorzen.identity.domain.UserCredential;
import com.tutorzen.identity.dto.AuthResponse;
import com.tutorzen.identity.dto.RefreshTokenRequest;
import com.tutorzen.identity.dto.SignInRequest;
import com.tutorzen.identity.dto.UserProfileDto;
import com.tutorzen.identity.repository.RefreshTokenRepository;
import com.tutorzen.identity.repository.UserCredentialRepository;
import com.tutorzen.identity.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            UserCredentialRepository credentialRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse signIn(SignInRequest request) {
        User user;
        if (request.tenantId() != null && !request.tenantId().isBlank()) {
            user = userRepository.findByTenantIdAndEmail(request.tenantId().trim(), request.email().trim().toLowerCase())
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        } else {
            List<User> users = userRepository.findByEmail(request.email().trim().toLowerCase());
            if (users.isEmpty()) {
                throw new BadCredentialsException("Invalid email or password");
            }
            if (users.size() > 1) {
                throw new BadCredentialsException("Multiple accounts found for this email. Please specify tenant identifier.");
            }
            user = users.get(0);
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("User account is inactive");
        }

        UserCredential credential = credentialRepository.findById(user.getId())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), credential.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = generateSecureToken();
        String tokenHash = hashToken(rawRefreshToken);

        RefreshToken refreshToken = new RefreshToken(
                UUID.randomUUID().toString(),
                user.getTenantId(),
                user.getId(),
                tokenHash,
                Instant.now().plusSeconds(jwtService.getRefreshTokenExpirySeconds()),
                false,
                Instant.now()
        );
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.of(
                accessToken,
                rawRefreshToken,
                jwtService.getAccessTokenExpirySeconds(),
                toProfileDto(user)
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.refreshToken().trim());
        RefreshToken existingToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));

        if (existingToken.isRevoked() || existingToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        User user = userRepository.findById(existingToken.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User account not found"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("User account is inactive");
        }

        // Token rotation: Revoke used token and issue a fresh one
        existingToken.setRevoked(true);
        refreshTokenRepository.save(existingToken);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRawRefreshToken = generateSecureToken();
        String newTokenHash = hashToken(newRawRefreshToken);

        RefreshToken newRefreshToken = new RefreshToken(
                UUID.randomUUID().toString(),
                user.getTenantId(),
                user.getId(),
                newTokenHash,
                Instant.now().plusSeconds(jwtService.getRefreshTokenExpirySeconds()),
                false,
                Instant.now()
        );
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.of(
                newAccessToken,
                newRawRefreshToken,
                jwtService.getAccessTokenExpirySeconds(),
                toProfileDto(user)
        );
    }

    @Transactional
    public void signOut(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = hashToken(rawRefreshToken.trim());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
    }

    private UserProfileDto toProfileDto(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getTenantId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    private String generateSecureToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}

