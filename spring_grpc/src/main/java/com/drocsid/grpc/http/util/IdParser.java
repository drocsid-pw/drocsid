package com.drocsid.grpc.http.util;

import io.grpc.Status;
import io.grpc.StatusRuntimeException;

import java.math.BigInteger;

public final class IdParser {

    private IdParser() {}

    /**
     * Parses ids used in API paths/queries as numeric strings.
     * Throws INVALID_ARGUMENT (400 in REST mapping) when parsing fails.
     */
    public static BigInteger toBigInteger(String raw, String fieldName) throws StatusRuntimeException {
        if (raw == null || raw.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT
                .withDescription(fieldName + " is required")
                .asRuntimeException();
        }

        try {
            return new BigInteger(raw);
        } catch (NumberFormatException e) {
            throw Status.INVALID_ARGUMENT
                .withDescription(fieldName + " must be a numeric string")
                .asRuntimeException();
        }
    }
}
