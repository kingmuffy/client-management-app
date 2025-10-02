package com.omamofe.clientmanagement.security;

import com.omamofe.clientmanagement.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${security.jwt.secret}") String secretBase64OrPlain,
            @Value("${security.jwt.expiration-ms}") long expirationMs
    ) {
        // Accept either plain text (>=32 chars) or Base64 secret
        byte[] keyBytes = secretBase64OrPlain.matches("^[A-Za-z0-9+/=]+$")
                ? Decoders.BASE64.decode(secretBase64OrPlain)
                : secretBase64OrPlain.getBytes();
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", user.getEmail());
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("name", user.getFullName());

        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiresAt = new Date(now + expirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiresAt)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
