package com.omamofe.clientmanagement.exception;

public class DraftNotFoundException extends RuntimeException {
    public DraftNotFoundException(Long id) {
        super("Draft with id " + id + " not found");
    }
}
