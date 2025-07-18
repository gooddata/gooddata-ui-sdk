// (C) 2023-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { TopBar } from "../../tools/dashboards";
import { Api } from "../../tools/api";
import { ShareDialog } from "../../tools/shareDialog";
import { getProjectId } from "../../support/constants";
import { Users } from "../../tools/users";
import { Messages } from "../../tools/messages";
import { DashboardAccess, WorkspaceAccess } from "../../tools/permissions";
import { Dashboards } from "../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

describe("Share Dashboard To Everyone", { tags: ["checklist_integrated_tiger"] }, () => {
    const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
    const allUsers = "All users";
    const topBar = new TopBar();
    const shareDialog = new ShareDialog();
    const message = new Messages();

    describe("Basic cases", () => {
        beforeEach(() => {
            Users.switchToDefaultUser();
            Api.setEarlyAccess(getProjectId(), permissionsFeatureFlagEarlyAccess);

            Navigation.visit("dashboard/dashboard-tiger-permissions");
        });

        it("should not display All users when opening the share dialog", () => {
            topBar.enterSharing();
            shareDialog.dialogExists(true).addButtonIsActive().shareItemExistsForUserOrGroup(allUsers, false);
        });

        it("should able to share the dashboard to All users", () => {
            topBar.enterSharing();
            shareDialog
                .dialogExists(true)
                .addButtonIsActive()
                .clickOnAddButton()
                .clickOnUserOrGroupDropdownOption(allUsers)
                .setPermission(allUsers, "Can view & share")
                .share();

            message.hasSuccessMessage("Sharing updated.");

            topBar.enterSharing();
            shareDialog.shareItemExistsForUserOrGroup(allUsers, true).cancel();
        });

        it("should able to update permission for All users item", () => {
            topBar.enterSharing();
            shareDialog.dialogExists(true).setPermission(allUsers, "Can view").save();

            message.hasSuccessMessage("Sharing updated.");

            topBar.enterSharing();
            shareDialog.hasPermissionSet(allUsers, "Can view").cancel();
        });

        it("should able to remove All user item in the share dialog", () => {
            topBar.enterSharing();
            shareDialog
                .dialogExists(true)
                .addButtonIsActive()
                .shareItemExistsForUserOrGroup(allUsers, true)
                .remove(allUsers)
                .save();

            message.hasSuccessMessage("Sharing updated.");

            topBar.enterSharing();
            shareDialog.shareItemExistsForUserOrGroup(allUsers, false).cancel();
        });
    });

    describe("Check user permissions", () => {
        const viewUser = "test-user-view";
        const shareUser = "test-user-share";
        const editUser = "test-user-edit";
        const groupName = "groupTestPermission";

        function removeUsersAndGroups() {
            for (const user of [viewUser, shareUser, editUser]) {
                Users.deleteUser(user);
            }
            Users.deleteGroup(groupName);
        }

        function createUsersAndGroups() {
            Users.createGroup(groupName);
            const userPermissions = [viewUser, shareUser, editUser].map((user) => {
                const userType = user.split("-")[2];
                const permission = userType === "edit" ? "MANAGE" : userType === "share" ? "ANALYZE" : "VIEW";
                Users.createUser(user, [groupName]);
                return { user, permission };
            });
            WorkspaceAccess.assignUserPermissionToWorkspace(getProjectId(), userPermissions);
        }

        describe("when sharing dashboard with view permission", () => {
            before(() => {
                Users.switchToDefaultUser();
                Api.setEarlyAccess(getProjectId(), permissionsFeatureFlagEarlyAccess);

                removeUsersAndGroups();
                createUsersAndGroups();
                DashboardAccess.assignRulePermissionToDashboard(getProjectId(), Dashboards.KPIs);
            });
            it("should view user can access with view permission only the dashboard after sharing to everyone", () => {
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.enterSharing();
                shareDialog
                    .dialogExists(true)
                    .addButtonIsActive()
                    .clickOnAddButton()
                    .clickOnUserOrGroupDropdownOption(allUsers)
                    .setPermission(allUsers, "Can view")
                    .share();

                message.hasSuccessMessage("Sharing updated.");

                Users.switchToUser(viewUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.dashboardTitleExist(true);
                topBar.shareButtonExists(false);
            });

            it("should share user can access the dashboard with view permission only after sharing to everyone", () => {
                Users.switchToUser(shareUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.dashboardTitleExist(true);
                topBar.shareButtonExists(false);
            });

            it("should edit user can access the dashboard after sharing to everyone", () => {
                Users.switchToUser(editUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.shareButtonExists(true).enterSharing();
                shareDialog.dialogExists(true).hasPermissionSet(allUsers, "Can view");
            });
        });

        describe("when sharing dashboard with view & share permission", () => {
            before(() => {
                Users.switchToDefaultUser();
                Api.setEarlyAccess(getProjectId(), permissionsFeatureFlagEarlyAccess);

                removeUsersAndGroups();
                createUsersAndGroups();
                DashboardAccess.assignRulePermissionToDashboard(getProjectId(), Dashboards.KPIs);
            });

            it("should view user can access the dashboard with view & share permissions after sharing to everyone", () => {
                Navigation.visit("dashboard/dashboard-tiger-permissions");
                topBar.enterSharing();
                shareDialog
                    .dialogExists(true)
                    .addButtonIsActive()
                    .clickOnAddButton()
                    .clickOnUserOrGroupDropdownOption(allUsers)
                    .setPermission(allUsers, "Can view & share")
                    .share();

                message.hasSuccessMessage("Sharing updated.");

                Users.switchToUser(viewUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.shareButtonExists(true).enterSharing();
                shareDialog
                    .dialogExists(true)
                    .hasPermissionSet(allUsers, "Can view & share")
                    .openDropdownForUserOrGroup(allUsers)
                    .isPermissionDisabled("Can edit & share");
            });

            it("should share user can access the dashboard with view & share permissions after sharing to everyone", () => {
                Users.switchToUser(shareUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.shareButtonExists(true).enterSharing();
                shareDialog
                    .dialogExists(true)
                    .hasPermissionSet(allUsers, "Can view & share")
                    .openDropdownForUserOrGroup(allUsers)
                    .isPermissionDisabled("Can edit & share");
            });

            it("should edit user can access the dashboard with full permissions after sharing to everyone", () => {
                Users.switchToUser(editUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.shareButtonExists(true).enterSharing();
                shareDialog.dialogExists(true).hasPermissionSet(allUsers, "Can view & share");
            });
        });

        describe("when sharing dashboard with edit & share permission", () => {
            before(() => {
                Users.switchToDefaultUser();
                Api.setEarlyAccess(getProjectId(), permissionsFeatureFlagEarlyAccess);

                removeUsersAndGroups();
                createUsersAndGroups();
                DashboardAccess.assignRulePermissionToDashboard(getProjectId(), Dashboards.KPIs);
            });
            it("should view user can access the dashboard with full permission after sharing to everyone", () => {
                Navigation.visit("dashboard/dashboard-tiger-permissions");
                topBar.enterSharing();
                shareDialog
                    .dialogExists(true)
                    .addButtonIsActive()
                    .clickOnAddButton()
                    .clickOnUserOrGroupDropdownOption(allUsers)
                    .setPermission(allUsers, "Can edit & share")
                    .share();

                message.hasSuccessMessage("Sharing updated.");

                Users.switchToUser(viewUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.shareButtonExists(true).enterSharing();
                shareDialog
                    .dialogExists(true)
                    .hasPermissionSet(allUsers, "Can edit & share")
                    .openDropdownForUserOrGroup(allUsers)
                    .getPermissionsDropdownElement()
                    .find(".is-disabled")
                    .should("not.exist");
            });

            it("should share user can access the dashboard after sharing to everyone", () => {
                Users.switchToUser(shareUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.shareButtonExists(true).enterSharing();
                shareDialog
                    .dialogExists(true)
                    .hasPermissionSet(allUsers, "Can edit & share")
                    .openDropdownForUserOrGroup(allUsers)
                    .getPermissionsDropdownElement()
                    .find(".is-disabled")
                    .should("not.exist");
            });

            it("should edit user can access the dashboard with correct permissions after sharing to everyone", () => {
                Users.switchToUser(editUser);
                Navigation.visit("dashboard/dashboard-tiger-permissions");

                topBar.shareButtonExists(true).enterSharing();
                shareDialog
                    .dialogExists(true)
                    .hasPermissionSet(allUsers, "Can edit & share")
                    .openDropdownForUserOrGroup(allUsers)
                    .getPermissionsDropdownElement()
                    .find(".is-disabled")
                    .should("not.exist");
            });
        });
    });
});
