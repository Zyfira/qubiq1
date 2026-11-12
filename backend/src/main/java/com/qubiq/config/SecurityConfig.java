
package com.qubiq.config;

import com.qubiq.security.JwtFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allow the deployed Vercel frontend
        configuration.setAllowedOrigins(
            List.of("https://qubiq1.vercel.app")
        );

        // Allow required HTTP methods
        configuration.setAllowedMethods(
            List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        // Allow request headers
        configuration.setAllowedHeaders(
            List.of("*")
        );

        // Allow credentials
        configuration.setAllowCredentials(true);

        // Cache preflight response for one hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain filter(
            HttpSecurity http,
            JwtFilter jwtFilter,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {

        return http

            .csrf(csrf -> csrf.disable())

            // Explicitly connect CORS configuration to Spring Security
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Public authentication endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Health check endpoint
                .requestMatchers("/actuator/health").permitAll()

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // JWT authentication filter
            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            .build();
    }
}
