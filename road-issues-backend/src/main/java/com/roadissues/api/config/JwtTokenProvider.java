package com.roadissues.api.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT token provider for generating and validating tokens
 */
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration.hours}")
    private long jwtExpirationHours;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    /**
     * Generate JWT token for user
     */
    public String generateToken(Long userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        
        return createToken(claims, email);
    }
    
    /**
     * Create token with claims
     */
    private String createToken(Map<String, Object> claims, String subject) {
        long expirationTime = jwtExpirationHours * 60 * 60 * 1000; // Convert to milliseconds
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * Get all claims from token
     */
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Get email from token
     */
    public String getEmailFromToken(String token) {
        return getAllClaimsFromToken(token).getSubject();
    }
    
    /**
     * Get user ID from token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return ((Number) claims.get("userId")).longValue();
    }
    
    /**
     * Get role from token
     */
    public String getRoleFromToken(String token) {
        return (String) getAllClaimsFromToken(token).get("role");
    }
    
    /**
     * Check if token is valid
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get token expiration time in milliseconds
     */
    public long getTokenExpirationMs() {
        return jwtExpirationHours * 60 * 60 * 1000;
    }
}
