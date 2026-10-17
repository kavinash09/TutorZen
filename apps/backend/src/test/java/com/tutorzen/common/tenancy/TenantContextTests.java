package com.tutorzen.common.tenancy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class TenantContextTests {

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void setsAndRetrievesTenantIdCorrectly() {
        TenantContext.setTenantId("tenant-alpha");
        assertEquals(Optional.of("tenant-alpha"), TenantContext.getTenantId());
        assertEquals("tenant-alpha", TenantContext.getRequiredTenantId());
    }

    @Test
    void clearsTenantContext() {
        TenantContext.setTenantId("tenant-beta");
        TenantContext.clear();
        assertTrue(TenantContext.getTenantId().isEmpty());
    }

    @Test
    void rejectsNullOrBlankTenantId() {
        assertThrows(IllegalArgumentException.class, () -> TenantContext.setTenantId(null));
        assertThrows(IllegalArgumentException.class, () -> TenantContext.setTenantId("   "));
    }

    @Test
    void throwsIllegalStateExceptionWhenRequiredTenantMissing() {
        assertThrows(IllegalStateException.class, TenantContext::getRequiredTenantId);
    }
}

