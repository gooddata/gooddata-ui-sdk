// (C) 2021-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { API_TOKEN, describe } from "../config.js";
import {
    assignGroupPermissionToDashboard,
    assignUserPermissionToDashboard,
    assignUserPermissionToWorkspace,
    createTestGroup,
    createTestUser,
    deleteTestGroup,
    deleteTestUser,
    generateUUID,
    getWorkspaceId,
    mockFeatureHub,
    setEarlyAccess,
    switchToUser,
    visit,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Dashboard", "permissions", () => {
    test.describe("Basic case", () => {
        test(
            "should render topBar with share button",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger-permissions");

                // Click the share button on the top bar
                const shareButton = page.locator(".s-header-share-button");
                await expect(shareButton).toBeVisible();
                await shareButton.click();

                // Verify the share dialog exists and the add button is active
                const shareDialog = page.locator(".s-gd-share-dialog");
                await expect(shareDialog).toBeVisible();
                await expect(shareDialog.locator(".s-add-users-or-groups:not(.disabled)")).toBeVisible();
            },
        );
    });

    test.describe("Basic viewer case", () => {
        test(
            "should not show sharing for user who is only viewer",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const username = `test-viewer-${guid}`;
                const groupname = `test-viewers-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, username);
                await deleteTestGroup(request, groupname);
                await createTestGroup(request, groupname);
                await createTestUser(request, username, [groupname]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: username, permission: "VIEW" },
                ]);
                await assignUserPermissionToDashboard(
                    request,
                    workspaceId,
                    Dashboards.KPIs,
                    username,
                    "VIEW",
                );

                try {
                    // Switch to viewer user and visit the dashboard
                    await switchToUser(page, request, username);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Assert top bar exists but share button does not
                    await expect(page.locator(".s-top-bar")).toBeVisible();
                    await expect(page.locator(".s-header-share-button")).toBeHidden();
                } finally {
                    // Teardown
                    await deleteTestUser(request, username);
                    await deleteTestGroup(request, groupname);
                }
            },
        );

        test(
            "should show sharing for user who is viewer but got permission to share",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const username = `test-viewer-${guid}`;
                const groupname = `test-viewers-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, username);
                await deleteTestGroup(request, groupname);
                await createTestGroup(request, groupname);
                await createTestUser(request, username, [groupname]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: username, permission: "VIEW" },
                ]);
                await assignUserPermissionToDashboard(
                    request,
                    workspaceId,
                    Dashboards.KPIs,
                    username,
                    "VIEW",
                );

                try {
                    // As admin: visit the dashboard and open the share dialog
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists and add button is active
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();
                    await expect(shareDialog.locator(".s-add-users-or-groups:not(.disabled)")).toBeVisible();

                    // Set permission for the viewer user to "Can view & share"
                    const granteeItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: username });
                    await granteeItem.locator(".s-granular-permission-button").click();

                    const permissionsDropdown = page.locator(".s-granular-permissions-overlay");
                    await permissionsDropdown
                        .locator(".gd-granular-permission-select-item")
                        .getByText(/^Can view & share$/)
                        .click();

                    // Save the share dialog
                    await page.locator(".s-save").click();

                    // Assert success message
                    await expect(page.locator(".gd-messages .s-message.success")).toContainText(
                        "Sharing updated.",
                    );

                    // Switch to viewer user and visit the dashboard
                    await switchToUser(page, request, username);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Assert top bar exists and share button is visible
                    await expect(page.locator(".s-top-bar")).toBeVisible();
                    await expect(page.locator(".s-header-share-button")).toBeVisible();
                } finally {
                    // Teardown
                    await deleteTestUser(request, username);
                    await deleteTestGroup(request, groupname);
                }
            },
        );

        test(
            "should show sharing for user who is viewer but got permission to share via group",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const username = `test-viewer-${guid}`;
                const groupname = `test-viewers-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, username);
                await deleteTestGroup(request, groupname);
                await createTestGroup(request, groupname);
                await createTestUser(request, username, [groupname]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: username, permission: "VIEW" },
                ]);
                await assignUserPermissionToDashboard(
                    request,
                    workspaceId,
                    Dashboards.KPIs,
                    username,
                    "VIEW",
                );

                try {
                    // Assign SHARE permission to the group on the dashboard
                    await assignGroupPermissionToDashboard(
                        request,
                        workspaceId,
                        Dashboards.KPIs,
                        groupname,
                        "SHARE",
                    );

                    // Switch to viewer user and visit the dashboard
                    await switchToUser(page, request, username);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Assert top bar exists and share button is visible
                    await expect(page.locator(".s-top-bar")).toBeVisible();
                    await expect(page.locator(".s-header-share-button")).toBeVisible();
                } finally {
                    // Teardown
                    await deleteTestUser(request, username);
                    await deleteTestGroup(request, groupname);
                }
            },
        );

        test(
            "should be able to remove person from sharing list and that person should no longer be able to access",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const username = `test-viewer-${guid}`;
                const groupname = `test-viewers-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, username);
                await deleteTestGroup(request, groupname);
                await createTestGroup(request, groupname);
                await createTestUser(request, username, [groupname]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: username, permission: "VIEW" },
                ]);
                await assignUserPermissionToDashboard(
                    request,
                    workspaceId,
                    Dashboards.KPIs,
                    username,
                    "VIEW",
                );

                try {
                    // As admin: visit the dashboard and open the share dialog
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists and add button is active
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();
                    await expect(shareDialog.locator(".s-add-users-or-groups:not(.disabled)")).toBeVisible();

                    // Open permission dropdown for the user and click "Remove"
                    const granteeItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: username });
                    await granteeItem.locator(".s-granular-permission-button").click();

                    const permissionsDropdown = page.locator(".s-granular-permissions-overlay");
                    await permissionsDropdown.locator(".gd-list-item").getByText("Remove").click();

                    // Save the share dialog
                    await page.locator(".s-save").click();

                    // Re-open the share dialog and verify the user is no longer listed
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();
                    await expect(shareDialog).toBeVisible();
                    await expect(shareDialog.getByText(username)).toBeHidden();

                    // Cancel the share dialog
                    await page.locator(".s-cancel").click();

                    // Switch to the removed user and verify they cannot access the dashboard
                    await switchToUser(page, request, username);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    await expect(page.locator(".s-error")).toBeVisible();
                } finally {
                    // Teardown
                    await deleteTestUser(request, username);
                    await deleteTestGroup(request, groupname);
                }
            },
        );

        test(
            "should not allow users who have share permission to raise their permissions to edit",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const username = `test-viewer-${guid}`;
                const groupname = `test-viewers-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, username);
                await deleteTestGroup(request, groupname);
                await createTestGroup(request, groupname);
                await createTestUser(request, username, [groupname]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: username, permission: "VIEW" },
                ]);
                await assignUserPermissionToDashboard(
                    request,
                    workspaceId,
                    Dashboards.KPIs,
                    username,
                    "VIEW",
                );

                try {
                    // Assign SHARE permission to the user on the dashboard
                    await assignUserPermissionToDashboard(
                        request,
                        workspaceId,
                        Dashboards.KPIs,
                        username,
                        "SHARE",
                    );

                    // Switch to the user and visit the dashboard
                    await switchToUser(page, request, username);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Open the share dialog
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Open the permissions dropdown for the user
                    const granteeItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: username });
                    await granteeItem.locator(".s-granular-permission-button").click();

                    // Assert that "Can edit & share" is disabled
                    const permissionsDropdown = page.locator(".s-granular-permissions-overlay");
                    await expect(
                        permissionsDropdown
                            .locator(".gd-granular-permission-select-item.is-disabled")
                            .getByText(/^Can edit & share$/),
                    ).toBeVisible();
                } finally {
                    // Teardown
                    await deleteTestUser(request, username);
                    await deleteTestGroup(request, groupname);
                }
            },
        );

        test(
            "should not allow members of group who have share permission to raise permissions to edit",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const username = `test-viewer-${guid}`;
                const groupname = `test-viewers-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, username);
                await deleteTestGroup(request, groupname);
                await createTestGroup(request, groupname);
                await createTestUser(request, username, [groupname]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: username, permission: "VIEW" },
                ]);
                await assignUserPermissionToDashboard(
                    request,
                    workspaceId,
                    Dashboards.KPIs,
                    username,
                    "VIEW",
                );

                try {
                    // Assign SHARE permission to the group on the dashboard
                    await assignGroupPermissionToDashboard(
                        request,
                        workspaceId,
                        Dashboards.KPIs,
                        groupname,
                        "SHARE",
                    );

                    // Switch to the user and visit the dashboard
                    await switchToUser(page, request, username);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Open the share dialog
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Assert that the granular permission button for the user is disabled
                    const granteeItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: username });
                    await expect(granteeItem.locator(".s-granular-permission-button.disabled")).toBeVisible();
                } finally {
                    // Teardown
                    await deleteTestUser(request, username);
                    await deleteTestGroup(request, groupname);
                }
            },
        );
    });

    test.describe("Basic multiple groups/users case", () => {
        test(
            "should correctly visualize assigned different permissions for groups",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const firstUser = `test-viewer-1-${guid}`;
                const firstGroup = `test-viewers-1-${guid}`;
                const secondUser = `test-viewer-2-${guid}`;
                const secondGroup = `test-viewers-2-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, firstUser);
                await deleteTestUser(request, secondUser);
                await deleteTestGroup(request, firstGroup);
                await deleteTestGroup(request, secondGroup);
                await createTestGroup(request, firstGroup);
                await createTestGroup(request, secondGroup);
                // first user is part of both groups
                await createTestUser(request, firstUser, [firstGroup, secondGroup]);
                await createTestUser(request, secondUser, [firstGroup]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: firstUser, permission: "VIEW" },
                    { user: secondUser, permission: "VIEW" },
                ]);

                try {
                    // Assign SHARE to firstGroup, VIEW to secondGroup
                    await assignGroupPermissionToDashboard(
                        request,
                        workspaceId,
                        Dashboards.KPIs,
                        firstGroup,
                        "SHARE",
                    );
                    await assignGroupPermissionToDashboard(
                        request,
                        workspaceId,
                        Dashboards.KPIs,
                        secondGroup,
                        "VIEW",
                    );

                    // Switch to firstUser and visit the dashboard
                    await switchToUser(page, request, firstUser);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Open the share dialog
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Assert firstGroup has "Can view & share" permission
                    const firstGroupItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: firstGroup });
                    await expect(firstGroupItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can view & share$/,
                    );

                    // Assert secondGroup has "Can view" permission
                    const secondGroupItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: secondGroup });
                    await expect(secondGroupItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can view$/,
                    );
                } finally {
                    // Teardown
                    await deleteTestUser(request, firstUser);
                    await deleteTestUser(request, secondUser);
                    await deleteTestGroup(request, firstGroup);
                    await deleteTestGroup(request, secondGroup);
                }
            },
        );

        test(
            "should correctly visualize user & group permissions",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page, request }) => {
                const workspaceId = getWorkspaceId();
                const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
                const guid = generateUUID();
                const firstUser = `test-viewer-1-${guid}`;
                const firstGroup = `test-viewers-1-${guid}`;
                const secondUser = `test-viewer-2-${guid}`;
                const secondGroup = `test-viewers-2-${guid}`;

                // Setup
                await setEarlyAccess(request, workspaceId, permissionsFeatureFlagEarlyAccess);
                await deleteTestUser(request, firstUser);
                await deleteTestUser(request, secondUser);
                await deleteTestGroup(request, firstGroup);
                await deleteTestGroup(request, secondGroup);
                await createTestGroup(request, firstGroup);
                await createTestGroup(request, secondGroup);
                // first user is part of both groups
                await createTestUser(request, firstUser, [firstGroup, secondGroup]);
                await createTestUser(request, secondUser, [firstGroup]);
                await assignUserPermissionToWorkspace(request, workspaceId, [
                    { user: firstUser, permission: "VIEW" },
                    { user: secondUser, permission: "VIEW" },
                ]);

                try {
                    // Assign SHARE to firstGroup and firstUser on the dashboard
                    await assignGroupPermissionToDashboard(
                        request,
                        workspaceId,
                        Dashboards.KPIs,
                        firstGroup,
                        "SHARE",
                    );
                    await assignUserPermissionToDashboard(
                        request,
                        workspaceId,
                        Dashboards.KPIs,
                        firstUser,
                        "SHARE",
                    );

                    // Switch to firstUser and visit the dashboard
                    await switchToUser(page, request, firstUser);
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Open the share dialog
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Assert firstGroup has "Can view & share" permission
                    const firstGroupItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: firstGroup });
                    await expect(firstGroupItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can view & share$/,
                    );

                    // Assert firstUser's granular permission button is disabled
                    const firstUserItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: firstUser });
                    await expect(
                        firstUserItem.locator(".s-granular-permission-button.disabled"),
                    ).toBeVisible();
                } finally {
                    // Teardown
                    await deleteTestUser(request, firstUser);
                    await deleteTestUser(request, secondUser);
                    await deleteTestGroup(request, firstGroup);
                    await deleteTestGroup(request, secondGroup);
                }
            },
        );
    });
});
