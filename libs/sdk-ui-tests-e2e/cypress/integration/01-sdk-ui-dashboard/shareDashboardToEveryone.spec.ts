// (C) 2023 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { TopBar } from "../../tools/dashboards";
import { Api } from "../../tools/api";
import { ShareDialog } from "../../tools/shareDialog";
import { getProjectId } from "../../support/constants";
import { Users } from "../../tools/users";
import { Messages } from "../../tools/messages";

describe("Share Dashboard To Everyone", { tags: ["post-merge_integrated_tiger"] }, () => {
    const permissionsFeatureFlagEarlyAccess = "enableAnalyticalDashboardPermissions";
    const allUsers = "All users";
    const topBar = new TopBar();
    const shareDialog = new ShareDialog();
    const message = new Messages();

    describe("Basic case", () => {
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
});
