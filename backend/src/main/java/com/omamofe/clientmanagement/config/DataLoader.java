package com.omamofe.clientmanagement.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omamofe.clientmanagement.entity.Client;
import com.omamofe.clientmanagement.repository.ClientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Configuration
public class DataLoader {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    @Bean
    CommandLineRunner loadData(ClientRepository repo, ObjectMapper mapper) {
        return args -> {
            if (repo.count() > 0) {
                log.info("DB already contains {} clients; skipping seed.", repo.count());
                return;
            }

            try (InputStream in = getClass().getResourceAsStream("/clients.json")) {
                if (in == null) {
                    log.warn("clients.json not found in classpath.");
                    return;
                }

                // JSON strocture: { "clients": [ {...}, {...} ] }
                Map<String, List<Client>> wrapper = mapper.readValue(
                        in, new TypeReference<Map<String, List<Client>>>() {}
                );

                List<Client> clients = wrapper.get("clients");
                if (clients == null || clients.isEmpty()) {
                    log.warn(" No clients found in clients.json.");
                    return;
                }

                clients.stream()
                        .filter(Objects::nonNull)
                        .forEach(c -> c.setId(null));

                repo.saveAll(clients);

                log.info("Loaded {} clients into H2 DB. Example: {}",
                        clients.size(),
                        clients.get(0).getFullName());
            } catch (Exception e) {
                log.error("Failed to load clients.json", e);
            }
        };
    }
}
