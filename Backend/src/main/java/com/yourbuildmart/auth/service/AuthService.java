package com.yourbuildmart.auth.service;

import com.yourbuildmart.auth.dto.request.LoginRequest;
import com.yourbuildmart.auth.dto.request.RefreshTokenRequest;
import com.yourbuildmart.auth.dto.request.RegisterRequest;
import com.yourbuildmart.auth.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String email);
}
