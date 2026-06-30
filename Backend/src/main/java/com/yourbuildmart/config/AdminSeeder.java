package com.yourbuildmart.config;

import com.yourbuildmart.user.entity.Role;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the default admin account into the database on first startup.
 * Credentials are sourced from application.yml to keep them configurable.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name}")
    private String adminName;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            String[] parts = adminName.split(" ", 2);
            String firstName = parts[0];
            String lastName  = parts.length > 1 ? parts[1] : "Admin";

            User admin = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .phone("+910000000000")
                    .role(Role.ADMIN)
                    .active(true)
                    .build();

            userRepository.save(admin);
            log.info("✅ Admin user seeded: {}", adminEmail);
        } else {
            log.info("ℹ️  Admin user already exists, skipping seed.");
        }
    }
}
