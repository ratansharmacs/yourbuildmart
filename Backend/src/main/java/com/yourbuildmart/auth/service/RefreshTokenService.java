package com.yourbuildmart.auth.service;

import com.yourbuildmart.auth.entity.RefreshToken;
import com.yourbuildmart.auth.repository.RefreshTokenRepository;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Manages creation and rotation of refresh tokens.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiry;

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // One refresh token per user — delete old one first
        refreshTokenRepository.deleteByUser(user);

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpiry))
                .build();

        return refreshTokenRepository.save(token);
    }

    public RefreshToken verifyExpiry(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token has expired – please log in again");
        }
        return token;
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
    }

    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
