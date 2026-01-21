package com.roadissues.api.security;

import com.roadissues.api.config.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT authentication provider
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationProvider implements org.springframework.security.authentication.AuthenticationProvider {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String token = (String) authentication.getPrincipal();
        
        if (!jwtTokenProvider.validateToken(token)) {
            throw new org.springframework.security.core.AuthenticationException("Invalid JWT token") {
            };
        }
        
        String email = jwtTokenProvider.getEmailFromToken(token);
        String role = jwtTokenProvider.getRoleFromToken(token);
        
        List<org.springframework.security.core.GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
        
        return new org.springframework.security.core.Authentication() {
            @Override
            public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
                return authorities;
            }
            
            @Override
            public Object getCredentials() {
                return token;
            }
            
            @Override
            public Object getDetails() {
                return null;
            }
            
            @Override
            public Object getPrincipal() {
                return email;
            }
            
            @Override
            public boolean isAuthenticated() {
                return true;
            }
            
            @Override
            public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
            }
            
            @Override
            public String getName() {
                return email;
            }
        };
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(PreAuthenticatedAuthenticationToken.class);
    }
}
