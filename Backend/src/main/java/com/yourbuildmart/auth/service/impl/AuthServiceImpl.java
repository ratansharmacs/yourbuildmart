package com.yourbuildmart.auth.service.impl;

import com.yourbuildmart.auth.dto.request.LoginRequest;
import com.yourbuildmart.auth.dto.request.RefreshTokenRequest;
import com.yourbuildmart.auth.dto.request.RegisterRequest;
import com.yourbuildmart.auth.dto.response.AuthResponse;
import com.yourbuildmart.auth.entity.RefreshToken;
import com.yourbuildmart.auth.service.AuthService;
import com.yourbuildmart.auth.service.RefreshTokenService;
import com.yourbuildmart.email.EmailService;
import com.yourbuildmart.email.dto.EmailRequest;
import com.yourbuildmart.email.enums.EmailType;
import com.yourbuildmart.exception.ConflictException;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.security.JwtService;
import com.yourbuildmart.user.entity.Role;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication business logic – register, login, refresh, logout.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository       userRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtService           jwtService;
    private final RefreshTokenService  refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final EmailService         emailService;

    // ─── Register ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        // Phone: validate format and uniqueness
        String phone = request.getPhone();
        if (phone != null && !phone.isBlank()) {
            phone = phone.replaceAll("[\\s\\-().]", "");
            if (!phone.matches("^\\+[1-9]\\d{6,14}$")) {
                throw new BadRequestException(
                    "Invalid phone number format. Use international format with country code, e.g. +91 98765 43210");
            }
            if (userRepository.existsByPhone(phone)) {
                throw new ConflictException(
                    "This phone number is already registered with another account.");
            }
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .role(Role.USER)
                .active(true)
                .build();

        userRepository.save(user);

        emailService.sendEmail(EmailRequest.builder()
                .to(user.getEmail())
                .userName(user.getFirstName())
                .emailType(EmailType.WELCOME_EMAIL)
                .build());

        return buildAuthResponse(user);
    }

    // ─── Login ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException on wrong password (handled globally)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Explicit active check — disabled accounts cannot log in
        if (!user.isActive()) {
            throw new BadRequestException(
                "Your account has been disabled. Please contact support.");
        }

        return buildAuthResponse(user);
    }

    // ─── Refresh Token ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verifyExpiry(refreshToken);

        User user = refreshToken.getUser();

        // Disabled users cannot get new access tokens
        if (!user.isActive()) {
            refreshTokenService.deleteByUser(user);
            throw new BadRequestException(
                "Your account has been disabled. Please contact support.");
        }

        String accessToken = jwtService.generateAccessToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    // ─── Logout ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email)
                .ifPresent(refreshTokenService::deleteByUser);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        RefreshToken refresh = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refresh.getToken())
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
