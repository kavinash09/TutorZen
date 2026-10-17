package com.tutorzen.common.tenancy;

import java.util.Optional;

/**
 * Thread-local context holder for the currently authenticated tenant ID.
 * Protects tenant isolation across service calls.
 */
public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setTenantId(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException("Tenant ID cannot be null or blank");
        }
        CURRENT_TENANT.set(tenantId.trim());
    }

    public static Optional<String> getTenantId() {
        return Optional.ofNullable(CURRENT_TENANT.get());
    }

    public static String getRequiredTenantId() {
        return getTenantId().orElseThrow(() -> 
            new IllegalStateException("No tenant context found for the current execution thread"));
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}

