// (C) 2019-2022 GoodData Corporation
import * as Md from "../../../md/full";
import { withTestConfig } from "../../tools/configure";

import { newTestPlugin, newTestPluginLink } from "../../support/plugins";

describe("Layout", () => {
    beforeEach(() => {
        cy.login();

        const TEST_PLUGIN = newTestPlugin("test-plugin");
        withTestConfig({
            dashboardId: Md.Dashboards.DashboardWithPlugin,
            plugins: [TEST_PLUGIN],
            links: [newTestPluginLink(TEST_PLUGIN)],
        });
    });

    it("should add custom layout section to the dashboard", () => {
        cy.get(".s-fluid-layout-row-title").first().should("have.text", "Section Added By Plugin");
    });
});
