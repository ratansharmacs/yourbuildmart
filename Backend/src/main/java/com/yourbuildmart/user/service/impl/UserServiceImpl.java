package com.yourbuildmart.user.service.impl;

import com.yourbuildmart.email.EmailService;
import com.yourbuildmart.email.dto.EmailRequest;
import com.yourbuildmart.email.enums.EmailType;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.user.dto.request.ChangePasswordRequest;
import com.yourbuildmart.user.dto.request.UpdateProfileRequest;
import com.yourbuildmart.user.dto.response.UserResponse;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import com.yourbuildmart.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService    emailService;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        return toResponse(getUser(email));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUser(email);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Phone: validate format and uniqueness
        String phone = request.getPhone();
        if (phone != null && !phone.isBlank()) {
            phone = phone.replaceAll("[\\s\\-().]", ""); // normalise
            if (!phone.matches("^\\+[1-9]\\d{6,14}$")) {
                throw new BadRequestException(
                    "Invalid phone number format. Use international format with country code, e.g. +91 98765 43210");
            }
            if (userRepository.existsByPhoneAndEmailNot(phone, email)) {
                throw new BadRequestException(
                    "This phone number is already registered with another account.");
            }
            user.setPhone(phone);
        } else {
            user.setPhone(null);
        }

        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUser(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        emailService.sendEmail(EmailRequest.builder()
                .to(user.getEmail())
                .userName(user.getFirstName())
                .emailType(EmailType.PASSWORD_CHANGED)
                .build());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .profileImage(u.getProfileImage())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
