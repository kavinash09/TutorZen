package com.tutorzen.branch;

import com.tutorzen.academics.domain.Batch;
import com.tutorzen.academics.repository.BatchRepository;
import com.tutorzen.authorization.Permission;
import com.tutorzen.authorization.PermissionRepository;
import com.tutorzen.authorization.UserPermission;
import com.tutorzen.authorization.UserPermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BranchAndPermissionTests {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BranchAssignmentRepository branchAssignmentRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private UserPermissionRepository userPermissionRepository;

    @Autowired
    private BatchRepository batchRepository;

    private static final String TENANT_1 = "tenant-branch-test-1";
    private static final String TENANT_2 = "tenant-branch-test-2";

    @BeforeEach
    void setUp() {
        userPermissionRepository.deleteAll();
        branchAssignmentRepository.deleteAll();
        branchRepository.deleteAll();
        permissionRepository.deleteAll();
    }

    @Test
    void branchLifecycle_PersistsAndQueriesByTenant() {
        Branch branch1 = new Branch("br-01", TENANT_1, "Downtown Branch", "DT-01", "100 Main St", "+91 99999 11111", "ACTIVE");
        Branch branch2 = new Branch("br-02", TENANT_1, "Uptown Branch", "UT-01", "200 High St", "+91 99999 22222", "ACTIVE");
        Branch branchOtherTenant = new Branch("br-03", TENANT_2, "Downtown Branch", "DT-01", "300 Other St", "+91 88888 33333", "ACTIVE");

        branchRepository.saveAll(List.of(branch1, branch2, branchOtherTenant));

        List<Branch> tenant1Branches = branchRepository.findByTenantId(TENANT_1);
        assertEquals(2, tenant1Branches.size(), "Tenant 1 should have exactly 2 branches");

        List<Branch> tenant2Branches = branchRepository.findByTenantId(TENANT_2);
        assertEquals(1, tenant2Branches.size(), "Tenant 2 should have exactly 1 branch");

        Optional<Branch> found = branchRepository.findByTenantIdAndCode(TENANT_1, "DT-01");
        assertTrue(found.isPresent());
        assertEquals("Downtown Branch", found.get().getName());
        assertEquals("100 Main St", found.get().getAddress());
    }

    @Test
    void batchWithBranchId_LinksCorrectlyToBranch() {
        Branch branch = new Branch("br-batch-01", TENANT_1, "North Campus", "NC-01", "400 Campus Way", "+91 99999 44444", "ACTIVE");
        branchRepository.save(branch);

        Batch batch = new Batch("batch-nc-01", TENANT_1, "sub-math-11", "Batch North Alpha", "Room 301", branch.getId(), 35, Instant.now());
        batchRepository.save(batch);

        Optional<Batch> savedBatch = batchRepository.findById(batch.getId());
        assertTrue(savedBatch.isPresent());
        assertEquals(branch.getId(), savedBatch.get().getBranchId(), "Batch should store associated branch ID");
    }

    @Test
    void permissionsAndUserDelegation_EnforcesTenantAndBranchScoping() {
        // Seed standard permissions
        Permission viewFinance = new Permission("perm-vf", "VIEW_FINANCES", "FINANCE", "View offline fee transactions");
        Permission manageStaff = new Permission("perm-ms", "MANAGE_STAFF", "STAFF", "Manage teachers and staff");
        permissionRepository.saveAll(List.of(viewFinance, manageStaff));

        Optional<Permission> fetchedPerm = permissionRepository.findByCode("VIEW_FINANCES");
        assertTrue(fetchedPerm.isPresent());
        assertEquals("FINANCE", fetchedPerm.get().getCategory());

        // Delegate permissions to a moderator: VIEW_FINANCES scoped to branch 'br-south'
        UserPermission branchScopedPerm = new UserPermission(
                "up-01",
                TENANT_1,
                "usr-mod-01",
                viewFinance.getId(),
                "br-south",
                "usr-admin-01"
        );

        // Delegate MANAGE_STAFF tenant-wide (branchId = null)
        UserPermission tenantWidePerm = new UserPermission(
                "up-02",
                TENANT_1,
                "usr-mod-01",
                manageStaff.getId(),
                null,
                "usr-admin-01"
        );

        userPermissionRepository.saveAll(List.of(branchScopedPerm, tenantWidePerm));

        List<UserPermission> userPerms = userPermissionRepository.findByTenantIdAndUserId(TENANT_1, "usr-mod-01");
        assertEquals(2, userPerms.size());

        List<UserPermission> branchSpecificPerms = userPermissionRepository.findByTenantIdAndUserIdAndBranchId(TENANT_1, "usr-mod-01", "br-south");
        assertEquals(1, branchSpecificPerms.size());
        assertEquals(viewFinance.getId(), branchSpecificPerms.get(0).getPermissionId());

        assertTrue(userPermissionRepository.existsByTenantIdAndUserIdAndPermissionId(TENANT_1, "usr-mod-01", viewFinance.getId()));
        assertFalse(userPermissionRepository.existsByTenantIdAndUserIdAndPermissionId(TENANT_2, "usr-mod-01", viewFinance.getId()),
                "Cross-tenant permission check must return false");
    }

    @Test
    void branchAssignment_SupportsMultiBranchAndIdentifiesPrimary() {
        BranchAssignment primary = new BranchAssignment("ba-t1", TENANT_1, "usr-teacher-multi", "br-main", true);
        BranchAssignment secondary = new BranchAssignment("ba-t2", TENANT_1, "usr-teacher-multi", "br-satellite", false);
        branchAssignmentRepository.saveAll(List.of(primary, secondary));

        List<BranchAssignment> assignments = branchAssignmentRepository.findByTenantIdAndUserId(TENANT_1, "usr-teacher-multi");
        assertEquals(2, assignments.size(), "Teacher should have 2 assigned branches");

        Optional<BranchAssignment> primaryAssignment = branchAssignmentRepository.findByTenantIdAndUserIdAndPrimaryTrue(TENANT_1, "usr-teacher-multi");
        assertTrue(primaryAssignment.isPresent());
        assertEquals("br-main", primaryAssignment.get().getBranchId());
        assertTrue(primaryAssignment.get().isPrimary());
    }
}

