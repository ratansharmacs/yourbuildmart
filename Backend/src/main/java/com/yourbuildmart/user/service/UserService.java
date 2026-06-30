package com.yourbuildmart.user.service;

import com.yourbuildmart.user.dto.request.ChangePasswordRequest;
import com.yourbuildmart.user.dto.request.UpdateProfileRequest;
import com.yourbuildmart.user.dto.response.UserResponse;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}
