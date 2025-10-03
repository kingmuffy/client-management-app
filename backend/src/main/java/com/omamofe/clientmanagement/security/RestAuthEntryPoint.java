package com.omamofe.clientmanagement.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.*;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Map;

@Component
public class RestAuthEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res,
                         AuthenticationException ex) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(res.getOutputStream(),
                Map.of("error", "Unauthorized", "message", "Authentication required"));
    }
}
