package com.yourbuildmart.analytics.controller;

import com.yourbuildmart.analytics.entity.SearchLog;
import com.yourbuildmart.analytics.repository.SearchLogRepository;
import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Two groups of endpoints:
 *
 *  PUBLIC  POST /analytics/search-log          – called by the React frontend on every search
 *  ADMIN   GET  /admin/analytics/search-logs   – paginated log list
 *  ADMIN   GET  /admin/analytics/search-stats  – aggregate stats + top terms
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Search Analytics", description = "Track and report user search activity")
public class SearchAnalyticsController {

    private final SearchLogRepository repo;
    private final JwtService           jwtService;

    // ─── PUBLIC: log a search ─────────────────────────────────────────────────

    @PostMapping("/analytics/search-log")
    @Operation(summary = "Log a search query (called by frontend on every search)")
    public ResponseEntity<ApiResponse<Void>> logSearch(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {

        String query = body.getOrDefault("query", "").trim();
        if (query.isBlank() || query.length() < 2) {
            return ResponseEntity.ok(ApiResponse.success("Too short – not logged"));
        }

        Long   userId   = null;
        String userName = "Guest";

        // Try to extract user info from JWT if provided
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtService.extractUsername(token);
                if (email != null) {
                    userName = email;
                    // We don't have direct access to UserRepository here; userId stays null
                    // but the email is enough for display purposes.
                }
            } catch (Exception ignored) { /* invalid/expired token – treat as guest */ }
        }

        SearchLog log = SearchLog.builder()
                .query(query)
                .userId(userId)
                .userName(userName)
                .source(body.getOrDefault("source", "unknown"))
                .build();

        repo.save(log);
        return ResponseEntity.ok(ApiResponse.success("Logged"));
    }

    // ─── ADMIN: paginated log list ────────────────────────────────────────────

    @GetMapping("/admin/analytics/search-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Paginated list of all search logs with optional query filter")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLogs(
            @RequestParam(defaultValue = "")  String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<SearchLog> pageResult = repo.findFiltered(
                q.isBlank() ? null : q,
                PageRequest.of(page, size));

        List<Map<String, Object>> items = pageResult.getContent().stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",        s.getId());
            m.put("query",     s.getQuery());
            m.put("userName",  s.getUserName());
            m.put("source",    s.getSource());
            m.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : null);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content",       items);
        result.put("totalElements", pageResult.getTotalElements());
        result.put("totalPages",    pageResult.getTotalPages());
        result.put("currentPage",   page);

        return ResponseEntity.ok(ApiResponse.success("Search logs retrieved", result));
    }

    // ─── ADMIN: aggregate stats + top terms ──────────────────────────────────

    @GetMapping("/admin/analytics/search-stats")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Aggregate stats: totals, today count, top 10 terms")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {

        long totalSearches = repo.count();

        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        long todaySearches = repo.countByCreatedAtBetween(todayStart, LocalDateTime.now());

        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        long weekSearches = repo.countByCreatedAtBetween(weekStart, LocalDateTime.now());

        // Top 10 search terms
        List<Object[]> raw = repo.topQueries(PageRequest.of(0, 10));
        List<Map<String, Object>> topTerms = raw.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("term",  row[0]);
            m.put("count", row[1]);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalSearches",  totalSearches);
        stats.put("todaySearches",  todaySearches);
        stats.put("weekSearches",   weekSearches);
        stats.put("topTerms",       topTerms);

        return ResponseEntity.ok(ApiResponse.success("Search stats retrieved", stats));
    }
}
