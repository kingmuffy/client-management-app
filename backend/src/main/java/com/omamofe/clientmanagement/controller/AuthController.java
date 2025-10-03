package com.omamofe.clientmanagement.controller;

import com.omamofe.clientmanagement.dto.LoginRequest;
import com.omamofe.clientmanagement.dto.LoginResponse;
import com.omamofe.clientmanagement.dto.UserDto;
import com.omamofe.clientmanagement.entity.User;
import com.omamofe.clientmanagement.exception.AuthException;
import com.omamofe.clientmanagement.repository.UserRepository;
import com.omamofe.clientmanagement.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwt;

    public AuthController(UserRepository userRepository, JwtService jwt) {
        this.userRepository = userRepository;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        String email = req.getEmail().trim();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AuthException("User not found"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new AuthException("User account is inactive");
        }
        String token = jwt.generateToken(user);

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());

        return ResponseEntity.ok(new LoginResponse(token, dto));
    }
}
