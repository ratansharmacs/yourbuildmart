package com.yourbuildmart.security.filter;

import com.yourbuildmart.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService         jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest  request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain         filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String method     = request.getMethod();
        final String uri        = request.getRequestURI();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("[JWT-FILTER]   No Bearer token — {}: {}", method, uri);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt   = authHeader.substring(7);
            final String email = jwtService.extractUsername(jwt);
            log.debug("[JWT-FILTER]   Token received — user={}, {}: {}", email, method, uri);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("[JWT-FILTER] ✅ Auth set — user={}, roles={}", email, userDetails.getAuthorities());
                } else {
                    log.warn("[JWT-FILTER] ✖ Token invalid for user={} on {}: {}", email, method, uri);
                }
            }
        } catch (Exception e) {
            log.warn("[JWT-FILTER] ✖ JWT error on {}: {} — {}", method, uri, e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
