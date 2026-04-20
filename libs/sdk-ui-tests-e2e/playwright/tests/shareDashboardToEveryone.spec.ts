// (C) 2023-2026 GoodData Corporation

import { type APIRequestContext, expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/sdk-e2e-utils";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { API_TOKEN, test } from "../config.js";
import {
    assignRulePermissionToDashboard,
    assignUserPermissionToWorkspace,
    createTestGroup,
    createTestUser,
    deleteTestGroup,
    deleteTestUser,
    generateRandomId,
    getWorkspaceId,
    setEarlyAccess,
    switchToUser,
    visit,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
});

test.topLevelDescribe(
    "Share Dashboard To Everyone",
    "shareDashboardToEveryone",
    { additionalWindowProperties: { useSafeWidgetLocalIdentifiersForE2e: true } },
    () => {
        test.describe("Basic cases", () => {
            test.beforeEach(async ({ request }) => {
                await assignRulePermissionToDashboard(request, getWorkspaceId(), Dashboards.ParentDashboard);
            });

            test(
                "should not display All users when opening the share dialog",
                {
                    tag: ["@pre-merge-integrated"],
                },
                async ({ page }) => {
                    await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                    await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                async ({ page, request }) => {
                    await assignRulePermissionToDashboard(
                        request,
                        getWorkspaceId(),
                        Dashboards.ParentDashboard,
                        "SHARE",
                    );
                    await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                async ({ page, request }) => {
                    await assignRulePermissionToDashboard(
                        request,
                        getWorkspaceId(),
                        Dashboards.ParentDashboard,
                        "VIEW",
                    );
                    await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
            const USER_PREFIX = "SDK_test_user";
            const USER_AUTH_PREFIX = "SDK_test_authId";
            const USERGROUP_PREFIX = "SDK_test_usergroup";

            const viewUser = generateRandomId(`${USER_PREFIX}_view`);
            const shareUser = generateRandomId(`${USER_PREFIX}_analyze`);
            const editUser = generateRandomId(`${USER_PREFIX}_manage`);
            const groupName = generateRandomId(USERGROUP_PREFIX);

            const dashboardId = Dashboards.ParentDashboard;
            const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";

            async function removeUsersAndGroups(request: APIRequestContext) {
                for (const user of [viewUser, shareUser, editUser]) {
                    await deleteTestUser(request, user);
                }
                await deleteTestGroup(request, groupName);
            }

            async function createUsersAndGroups(request: APIRequestContext) {
                await createTestGroup(request, groupName);
                const userSpecs: Array<{ user: string; permission: string }> = [
                    { user: viewUser, permission: "VIEW" },
                    { user: shareUser, permission: "ANALYZE" },
                    { user: editUser, permission: "MANAGE" },
                ];
                const permissions: Array<{ user: string; permission: string }> = [];
                for (const { user, permission } of userSpecs) {
                    await createTestUser(request, user, [groupName], generateRandomId(USER_AUTH_PREFIX));
                    permissions.push({ user, permission });
                }
                await assignUserPermissionToWorkspace(request, getWorkspaceId(), permissions);
            }

            test.afterAll(async ({ request }) => {
                await removeUsersAndGroups(request);
                await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId);
            });

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
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

                        // Click the share button on the top bar
                        const shareButton = page.locator(".s-header-share-button");
                        await expect(shareButton).toBeVisible();
                        await shareButton.click();

                        // Verify the share dialog exists and the add button is active
                        const shareDialog = page.locator(".s-gd-share-dialog");
                        await expect(shareDialog).toBeVisible();
                        await expect(
                            shareDialog.locator(".s-add-users-or-groups:not(.disabled)"),
                        ).toBeVisible();

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
                        await switchToUser(page, request, viewUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId, "VIEW");
                        // Switch to the share user
                        await switchToUser(page, request, shareUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId, "VIEW");
                        // Switch to the edit user
                        await switchToUser(page, request, editUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

                        // Click the share button on the top bar
                        const shareButton = page.locator(".s-header-share-button");
                        await expect(shareButton).toBeVisible();
                        await shareButton.click();

                        // Verify the share dialog exists and the add button is active
                        const shareDialog = page.locator(".s-gd-share-dialog");
                        await expect(shareDialog).toBeVisible();
                        await expect(
                            shareDialog.locator(".s-add-users-or-groups:not(.disabled)"),
                        ).toBeVisible();

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
                        await switchToUser(page, request, viewUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await assignRulePermissionToDashboard(
                            request,
                            getWorkspaceId(),
                            dashboardId,
                            "SHARE",
                        );
                        // Switch to the share user
                        await switchToUser(page, request, shareUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await assignRulePermissionToDashboard(
                            request,
                            getWorkspaceId(),
                            dashboardId,
                            "SHARE",
                        );
                        // Switch to the edit user
                        await switchToUser(page, request, editUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

                        // Click the share button on the top bar
                        const shareButton = page.locator(".s-header-share-button");
                        await expect(shareButton).toBeVisible();
                        await shareButton.click();

                        // Verify the share dialog exists and the add button is active
                        const shareDialog = page.locator(".s-gd-share-dialog");
                        await expect(shareDialog).toBeVisible();
                        await expect(
                            shareDialog.locator(".s-add-users-or-groups:not(.disabled)"),
                        ).toBeVisible();

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
                        await switchToUser(page, request, viewUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId, "EDIT");
                        // Switch to the share user
                        await switchToUser(page, request, shareUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
                        await assignRulePermissionToDashboard(request, getWorkspaceId(), dashboardId, "EDIT");
                        // Switch to the edit user
                        await switchToUser(page, request, editUser);
                        await visit(page, "dashboard/dashboard-tiger-share-everyone-permission");

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
    },
);
