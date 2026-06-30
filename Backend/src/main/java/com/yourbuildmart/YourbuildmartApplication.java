package com.yourbuildmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * YourBuildMart – Production-grade ecommerce backend.
 * Entry point for the Spring Boot application.
 */
@SpringBootApplication
@EntityScan(basePackages = "com.yourbuildmart")
@EnableJpaRepositories(basePackages = "com.yourbuildmart")
@EnableJpaAuditing
@EnableAsync
public class YourbuildmartApplication {

    public static void main(String[] args) {
        SpringApplication.run(YourbuildmartApplication.class, args);
    }
}
