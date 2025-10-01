package com.omamofe.clientmanagement.config;

import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omamofe.clientmanagement.entity.Role;
import com.omamofe.clientmanagement.entity.User;
import com.omamofe.clientmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Configuration
public class UserDataLoader {

    private static final Logger log = LoggerFactory.getLogger(UserDataLoader.class);

    @Bean
    CommandLineRunner seedUsers(UserRepository repo, ObjectMapper baseMapper) {
        // make a safe copy that accepts trailing commas (users.json has them)
        final ObjectMapper mapper = baseMapper.copy()
                .configure(JsonReadFeature.ALLOW_TRAILING_COMMA.mappedFeature(), true);

        return args -> {
            if (repo.count() > 0) {
                log.info("Users already present ({}); skipping user seed.", repo.count());
                return;
            }

            try (InputStream in = getClass().getResourceAsStream("/users.json")) {
                if (in == null) {
                    log.warn("users.json not found in classpath; skipping user seed.");
                    return;
                }

                // Structure: { "users": [ { fullName, email, role }, ... ] }
                Map<String, List<Map<String, Object>>> wrapper =
                        mapper.readValue(in, new TypeReference<>() {});

                List<Map<String, Object>> raw = wrapper.get("users");
                if (raw == null || raw.isEmpty()) {
                    log.warn("'users' array missing/empty in users.json; nothing to seed.");
                    return;
                }

                List<User> users = raw.stream().map(m -> {
                    String email = String.valueOf(m.get("email"));
                    String fullName = String.valueOf(m.get("fullName"));
                    String roleStr = String.valueOf(m.get("role"));

                    // forgiving about case/whitespace; default to VIEWER if missing/unknown
                    Role role;
                    try {
                        role = Role.valueOf(roleStr.trim().toUpperCase());
                    } catch (Exception ex) {
                        role = Role.VIEWER;
                    }

                    return User.builder()
                            .id(null)           //  JPA generate IDs
                            .email(email)
                            .fullName(fullName)
                            .role(role)
                            .active(true)
                            .build();
                }).toList();

                repo.saveAll(users);
                log.info("Loaded {} users into H2. Example: {} ({})",
                        users.size(), users.getFirst().getEmail(), users.getFirst().getRole());
            } catch (Exception e) {
                log.error(" Failed to seed users from users.json", e);
            }
        };
    }
}
