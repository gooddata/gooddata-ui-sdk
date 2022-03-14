// (C) 2019-2022 GoodData Corporation
import * as Md from "../../../md/full";
import { withTestConfig } from "../../tools/configure";

import { newTestPlugin, newTestPluginLink } from "../../support/plugins";

describe("Widgets", () => {
    beforeEach(() => {
        cy.login();

        const TEST_PLUGIN = newTestPlugin("test-plugin");
        withTestConfig({
            dashboardId: Md.Dashboards.DashboardWithPlugin,
            plugins: [TEST_PLUGIN],
            links: [newTestPluginLink(TEST_PLUGIN)],
        });
    });

    it("should add custom widget to the dashboard", () => {
        cy.get(".s-custom-widget").should("exist");
    });
});
