// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { TopBar, Dashboard } from "../../tools/dashboards";
import { Api } from "../../tools/api";
import { ShareDialog } from "../../tools/shareDialog";
import { getProjectId } from "../../support/constants";
import { Users } from "../../tools/users";
import { DashboardAccess, WorkspaceAccess } from "../../tools/permissions";
import { Dashboards } from "../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

Cypress.on("uncaught:exception", (error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Dashboard", { tags: ["post-merge_integrated_tiger"] }, () => {
    describe("Basic case", () => {
        beforeEach(() => {
            cy.login();
            Users.switchToDefaultUser();
            Api.setEarlyAccess(getProjectId(), "develop");

            Navigation.visit("dashboard/dashboard-tiger-permissions");
        });

        it("should render topBar with share button", () => {
            const topBar = new TopBar();
            topBar.shareButtonExists();
            topBar.clickShareButton();
            cy.debug();

            new ShareDialog().dialogExists(true).addButtonIsActive();
        });
    });
    describe("Basic viewer case", () => {
        const username = "test-viewer";
        const groupname = "test-viewers";

        function deleteUserAndGroup(user: string, group: string) {
            Users.deleteUser(user);
            Users.deleteGroup(group);
        }

        beforeEach(() => {
            cy.login();
            Users.switchToDefaultUser();
            Api.setEarlyAccess(getProjectId(), "develop");

            deleteUserAndGroup(username, groupname);
            Users.createGroup(groupname);
            Users.createUser(username, [groupname]);
            WorkspaceAccess.assignUserPermissionToWorkspace(getProjectId(), username, "VIEW");
            DashboardAccess.assignUserPermissionToDashboard(
                getProjectId(),
                Dashboards.KPIs,
                username,
                "VIEW",
            );
        });

        afterEach(() => {
            Users.switchToDefaultUser();
            deleteUserAndGroup(username, groupname);
        });

        it("should not show sharing for user who is only viewer", () => {
            Users.switchToUser(username);
            Navigation.visit("dashboard/dashboard-tiger-permissions");

            const dashboard = new Dashboard();
            dashboard.topBarExist();
            const topBar = new TopBar();
            topBar.shareButtonExists(false);
        });

        it("should show sharing for user who is viewer but got permission to share", () => {
            Navigation.visit("dashboard/dashboard-tiger-permissions");

            // share the dashboard with viewer user
            const topBar = new TopBar();
            topBar.shareButtonExists();
            topBar.clickShareButton();

            new ShareDialog()
                .dialogExists(true)
                .addButtonIsActive()
                .setPermission(username, "Can view & share")
                .save();

            // check that viewer can share
            Users.switchToUser(username);
            Navigation.visit("dashboard/dashboard-tiger-permissions");

            const dashboard = new Dashboard();
            dashboard.topBarExist();
            topBar.shareButtonExists(true);
        });
    });
});
