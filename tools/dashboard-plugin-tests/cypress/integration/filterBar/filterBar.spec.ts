// (C) 2019-2022 GoodData Corporation
import { withTestConfig } from "../../tools/configure";
import { PLUGIN_LATEST_CONFIG } from "../../support/constants";

// customize.filterBar().setRenderingMode("hidden");
function shouldHideFilterBar() {
    cy.get(".s-gd-dashboard-filter-bar").should("not.exist");
}

describe("Filter Bar", () => {
    describe("latest", () => {
        beforeEach(() => {
            cy.login();
            withTestConfig(PLUGIN_LATEST_CONFIG);
        });

        it("should cover filter bar API", () => {
            shouldHideFilterBar();
        });
    });
});
