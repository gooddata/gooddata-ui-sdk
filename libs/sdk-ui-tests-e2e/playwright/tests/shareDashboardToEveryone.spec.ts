// (C) 2023-2026 GoodData Corporation

import { type APIRequestContext, expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    assignRulePermissionToDashboard,
    assignUserPermissionToWorkspace,
    createTestGroup,
    createTestUser,
    deleteTestGroup,
    deleteTestUser,
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

describe("Share Dashboard To Everyone", "shareDashboardToEveryone", () => {
    test.describe("Basic cases", () => {
        test(
            "should not display All users when opening the share dialog",
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

                // Verify "All users" text does NOT exist in the share dialog
                await expect(shareDialog.getByText("All users")).toHaveCount(0);
            },
        );

        test(
            "should able to share the dashboard to All users",
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

                // Click the add button to open the user/group picker
                await shareDialog.locator(".s-add-users-or-groups:not(.disabled)").click();

                // Select "All users" from the dropdown
                await shareDialog
                    .locator(".gd-share-dialog__option > .option-content")
                    .filter({ hasText: "All users" })
                    .click();

                // Open the permission dropdown for "All users" and set "Can view & share"
                const allUsersItem = shareDialog
                    .locator(".s-share-dialog-grantee-item")
                    .filter({ hasText: "All users" });
                await allUsersItem.locator(".s-granular-permission-button").click();
                await page
                    .locator(".s-granular-permissions-overlay .gd-granular-permission-select-item")
                    .getByText(/^Can view & share$/)
                    .click();

                // Click the Share button to submit
                await shareDialog.locator(".s-dialog-submit-button.s-share").click();

                // Verify the success message
                await expect(page.locator(".gd-messages .s-message.success")).toContainText(
                    "Sharing updated.",
                );

                // Re-open the share dialog and verify "All users" is now listed
                await expect(shareButton).toBeVisible();
                await shareButton.click();
                await expect(shareDialog).toBeVisible();
                await expect(shareDialog.getByText("All users")).toBeVisible();

                // Cancel the dialog
                await page.locator(".s-cancel").click();
            },
        );

        test(
            "should able to update permission for All users item",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger-permissions");

                // Open the share dialog
                const shareButton = page.locator(".s-header-share-button");
                await expect(shareButton).toBeVisible();
                await shareButton.click();

                const shareDialog = page.locator(".s-gd-share-dialog");
                await expect(shareDialog).toBeVisible();

                // Open the permission dropdown for "All users" and set "Can view"
                const allUsersItem = shareDialog
                    .locator(".s-share-dialog-grantee-item")
                    .filter({ hasText: "All users" });
                await allUsersItem.locator(".s-granular-permission-button").click();
                await page
                    .locator(".s-granular-permissions-overlay .gd-granular-permission-select-item")
                    .getByText(/^Can view$/)
                    .click();

                // Save the sharing changes
                await page.locator(".s-save").click();

                // Verify the success message
                await expect(page.locator(".gd-messages .s-message.success")).toContainText(
                    "Sharing updated.",
                );

                // Re-open the share dialog and verify permission is set to "Can view"
                await expect(shareButton).toBeVisible();
                await shareButton.click();
                await expect(shareDialog).toBeVisible();

                const allUsersItemAfterSave = shareDialog
                    .locator(".s-share-dialog-grantee-item")
                    .filter({ hasText: "All users" });
                await expect(allUsersItemAfterSave.locator(".s-granular-permission-button")).toHaveText(
                    /^Can view$/,
                );

                // Cancel the dialog
                await page.locator(".s-cancel").click();
            },
        );

        test(
            "should able to remove All user item in the share dialog",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger-permissions");

                // Open the share dialog
                const shareButton = page.locator(".s-header-share-button");
                await expect(shareButton).toBeVisible();
                await shareButton.click();

                // Verify the share dialog exists and the add button is active
                const shareDialog = page.locator(".s-gd-share-dialog");
                await expect(shareDialog).toBeVisible();
                await expect(shareDialog.locator(".s-add-users-or-groups:not(.disabled)")).toBeVisible();

                // Verify "All users" exists in the share dialog
                await expect(shareDialog.getByText("All users")).toBeVisible();

                // Open the permission dropdown for "All users" and click Remove
                const allUsersItem = shareDialog
                    .locator(".s-share-dialog-grantee-item")
                    .filter({ hasText: "All users" });
                await allUsersItem.locator(".s-granular-permission-button").click();
                await page
                    .locator(".s-granular-permissions-overlay .gd-list-item")
                    .getByText("Remove")
                    .click();

                // Save the sharing changes
                await page.locator(".s-save").click();

                // Verify the success message
                await expect(page.locator(".gd-messages .s-message.success")).toContainText(
                    "Sharing updated.",
                );

                // Re-open the share dialog and verify "All users" is no longer listed
                await expect(shareButton).toBeVisible();
                await shareButton.click();
                await expect(shareDialog).toBeVisible();
                await expect(shareDialog.getByText("All users")).toHaveCount(0);

                // Cancel the dialog
                await page.locator(".s-cancel").click();
            },
        );
    });

    test.describe("Check user permissions", () => {
        const viewUser = "test-user-view";
        const shareUser = "test-user-share";
        const editUser = "test-user-edit";
        const groupName = "groupTestPermission";
        const dashboardId = "601c81ae-0582-42f0-9f35-a4ec2a6a8497";
        const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";

        async function removeUsersAndGroups(request: APIRequestContext) {
            for (const user of [viewUser, shareUser, editUser]) {
                await deleteTestUser(request, user);
            }
            await deleteTestGroup(request, groupName);
        }

        async function createUsersAndGroups(request: APIRequestContext) {
            await createTestGroup(request, groupName);
            const permissions: Array<{ user: string; permission: string }> = [];
            for (const user of [viewUser, shareUser, editUser]) {
                const userType = user.split("-")[2];
                const permission = userType === "edit" ? "MANAGE" : userType === "share" ? "ANALYZE" : "VIEW";
                await createTestUser(request, user, [groupName]);
                permissions.push({ user, permission });
            }
            await assignUserPermissionToWorkspace(request, getWorkspaceId(), permissions);
        }

        test.describe("when sharing dashboard with view permission", () => {
            test.beforeAll(async ({ request }) => {
                await setEarlyAccess(request, getWorkspaceId(), permissionsFeatureFlagEarlyAccess);
                await removeUsersAndGroups(request);
                await createUsersAndGroups(request);
                await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId);
            });

            test(
                "should view user can access with view permission only the dashboard after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Click the share button on the top bar
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists and the add button is active
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();
                    await expect(shareDialog.locator(".s-add-users-or-groups:not(.disabled)")).toBeVisible();

                    // Click the add button to open the user/group picker
                    await shareDialog.locator(".s-add-users-or-groups:not(.disabled)").click();

                    // Select "All users" from the dropdown
                    await shareDialog
                        .locator(".gd-share-dialog__option > .option-content")
                        .filter({ hasText: "All users" })
                        .click();

                    // Open the permission dropdown for "All users" and set "Can view"
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await allUsersItem.locator(".s-granular-permission-button").click();
                    await page
                        .locator(".s-granular-permissions-overlay .gd-granular-permission-select-item")
                        .getByText(/^Can view$/)
                        .click();

                    // Click the Share button to submit
                    await shareDialog.locator(".s-dialog-submit-button.s-share").click();

                    // Verify the success message
                    await expect(page.locator(".gd-messages .s-message.success")).toContainText(
                        "Sharing updated.",
                    );

                    // Switch to the view user
                    await switchToUser(page, request, "test-user-view");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify dashboard title exists
                    await expect(page.locator(".s-gd-dashboard-title")).toBeVisible();

                    // Verify share button does NOT exist
                    await expect(page.locator(".s-header-share-button")).toHaveCount(0);
                },
            );

            test(
                "should share user can access the dashboard with view permission only after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    // Switch to the share user
                    await switchToUser(page, request, "test-user-share");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify dashboard title exists
                    await expect(page.locator(".s-gd-dashboard-title")).toBeVisible();

                    // Verify share button does NOT exist
                    await expect(page.locator(".s-header-share-button")).toHaveCount(0);
                },
            );

            test(
                "should edit user can access the dashboard after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    // Switch to the edit user
                    await switchToUser(page, request, "test-user-edit");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify share button exists and click it to enter sharing
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Verify "All users" has "Can view" permission
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await expect(allUsersItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can view$/,
                    );
                },
            );
        });

        test.describe("when sharing dashboard with view & share permission", () => {
            test.beforeAll(async ({ request }) => {
                await setEarlyAccess(request, getWorkspaceId(), permissionsFeatureFlagEarlyAccess);
                await removeUsersAndGroups(request);
                await createUsersAndGroups(request);
                await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId);
            });

            test(
                "should view user can access the dashboard with view & share permissions after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Click the share button on the top bar
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists and the add button is active
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();
                    await expect(shareDialog.locator(".s-add-users-or-groups:not(.disabled)")).toBeVisible();

                    // Click the add button to open the user/group picker
                    await shareDialog.locator(".s-add-users-or-groups:not(.disabled)").click();

                    // Select "All users" from the dropdown
                    await shareDialog
                        .locator(".gd-share-dialog__option > .option-content")
                        .filter({ hasText: "All users" })
                        .click();

                    // Open the permission dropdown for "All users" and set "Can view & share"
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await allUsersItem.locator(".s-granular-permission-button").click();
                    await page
                        .locator(".s-granular-permissions-overlay .gd-granular-permission-select-item")
                        .getByText(/^Can view & share$/)
                        .click();

                    // Click the Share button to submit
                    await shareDialog.locator(".s-dialog-submit-button.s-share").click();

                    // Verify the success message
                    await expect(page.locator(".gd-messages .s-message.success")).toContainText(
                        "Sharing updated.",
                    );

                    // Switch to the view user
                    await switchToUser(page, request, "test-user-view");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify share button exists and click it to enter sharing
                    const shareButtonAsUser = page.locator(".s-header-share-button");
                    await expect(shareButtonAsUser).toBeVisible();
                    await shareButtonAsUser.click();

                    // Verify the share dialog exists
                    const shareDialogAsUser = page.locator(".s-gd-share-dialog");
                    await expect(shareDialogAsUser).toBeVisible();

                    // Verify "All users" has "Can view & share" permission
                    const allUsersItemAsUser = shareDialogAsUser
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await expect(allUsersItemAsUser.locator(".s-granular-permission-button")).toHaveText(
                        /^Can view & share$/,
                    );

                    // Open the permission dropdown for "All users"
                    await allUsersItemAsUser.locator(".s-granular-permission-button").click();

                    // Verify "Can edit & share" is disabled in the dropdown
                    await expect(
                        page
                            .locator(
                                ".s-granular-permissions-overlay .gd-granular-permission-select-item.is-disabled",
                            )
                            .getByText(/^Can edit & share$/),
                    ).toBeVisible();
                },
            );

            test(
                "should share user can access the dashboard with view & share permissions after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    // Switch to the share user
                    await switchToUser(page, request, "test-user-share");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify share button exists and click it to enter sharing
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Verify "All users" has "Can view & share" permission
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await expect(allUsersItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can view & share$/,
                    );

                    // Open the permission dropdown for "All users"
                    await allUsersItem.locator(".s-granular-permission-button").click();

                    // Verify "Can edit & share" is disabled in the dropdown
                    await expect(
                        page
                            .locator(
                                ".s-granular-permissions-overlay .gd-granular-permission-select-item.is-disabled",
                            )
                            .getByText(/^Can edit & share$/),
                    ).toBeVisible();
                },
            );

            test(
                "should edit user can access the dashboard with full permissions after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    // Switch to the edit user
                    await switchToUser(page, request, "test-user-edit");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify share button exists and click it to enter sharing
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Verify "All users" has "Can view & share" permission
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await expect(allUsersItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can view & share$/,
                    );
                },
            );
        });

        test.describe("when sharing dashboard with edit & share permission", () => {
            test.beforeAll(async ({ request }) => {
                await setEarlyAccess(request, getWorkspaceId(), permissionsFeatureFlagEarlyAccess);
                await removeUsersAndGroups(request);
                await createUsersAndGroups(request);
                await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId);
            });

            test(
                "should view user can access the dashboard with full permission after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Click the share button on the top bar
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists and the add button is active
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();
                    await expect(shareDialog.locator(".s-add-users-or-groups:not(.disabled)")).toBeVisible();

                    // Click the add button to open the user/group picker
                    await shareDialog.locator(".s-add-users-or-groups:not(.disabled)").click();

                    // Select "All users" from the dropdown
                    await shareDialog
                        .locator(".gd-share-dialog__option > .option-content")
                        .filter({ hasText: "All users" })
                        .click();

                    // Open the permission dropdown for "All users" and set "Can edit & share"
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await allUsersItem.locator(".s-granular-permission-button").click();
                    await page
                        .locator(".s-granular-permissions-overlay .gd-granular-permission-select-item")
                        .getByText(/^Can edit & share$/)
                        .click();

                    // Click the Share button to submit
                    await shareDialog.locator(".s-dialog-submit-button.s-share").click();

                    // Verify the success message
                    await expect(page.locator(".gd-messages .s-message.success")).toContainText(
                        "Sharing updated.",
                    );

                    // Switch to the view user
                    await switchToUser(page, request, "test-user-view");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify share button exists and click it to enter sharing
                    const shareButtonAsUser = page.locator(".s-header-share-button");
                    await expect(shareButtonAsUser).toBeVisible();
                    await shareButtonAsUser.click();

                    // Verify the share dialog exists
                    const shareDialogAsUser = page.locator(".s-gd-share-dialog");
                    await expect(shareDialogAsUser).toBeVisible();

                    // Verify "All users" has "Can edit & share" permission
                    const allUsersItemAsUser = shareDialogAsUser
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await expect(allUsersItemAsUser.locator(".s-granular-permission-button")).toHaveText(
                        /^Can edit & share$/,
                    );

                    // Open the permission dropdown for "All users"
                    await allUsersItemAsUser.locator(".s-granular-permission-button").click();

                    // Verify no permissions are disabled in the dropdown
                    await expect(
                        page.locator(
                            ".s-granular-permissions-overlay .gd-granular-permission-select-item.is-disabled",
                        ),
                    ).toHaveCount(0);
                },
            );

            test(
                "should share user can access the dashboard after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    // Switch to the share user
                    await switchToUser(page, request, "test-user-share");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify share button exists and click it to enter sharing
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Verify "All users" has "Can edit & share" permission
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await expect(allUsersItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can edit & share$/,
                    );

                    // Open the permission dropdown for "All users"
                    await allUsersItem.locator(".s-granular-permission-button").click();

                    // Verify no permissions are disabled in the dropdown
                    await expect(
                        page.locator(
                            ".s-granular-permissions-overlay .gd-granular-permission-select-item.is-disabled",
                        ),
                    ).toHaveCount(0);
                },
            );

            test(
                "should edit user can access the dashboard with correct permissions after sharing to everyone",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page, request }) => {
                    // Switch to the edit user
                    await switchToUser(page, request, "test-user-edit");
                    await visit(page, "dashboard/dashboard-tiger-permissions");

                    // Verify share button exists and click it to enter sharing
                    const shareButton = page.locator(".s-header-share-button");
                    await expect(shareButton).toBeVisible();
                    await shareButton.click();

                    // Verify the share dialog exists
                    const shareDialog = page.locator(".s-gd-share-dialog");
                    await expect(shareDialog).toBeVisible();

                    // Verify "All users" has "Can edit & share" permission
                    const allUsersItem = shareDialog
                        .locator(".s-share-dialog-grantee-item")
                        .filter({ hasText: "All users" });
                    await expect(allUsersItem.locator(".s-granular-permission-button")).toHaveText(
                        /^Can edit & share$/,
                    );

                    // Open the permission dropdown for "All users"
                    await allUsersItem.locator(".s-granular-permission-button").click();

                    // Verify no permissions are disabled in the dropdown
                    await expect(
                        page.locator(
                            ".s-granular-permissions-overlay .gd-granular-permission-select-item.is-disabled",
                        ),
                    ).toHaveCount(0);
                },
            );
        });
    });
});
