// (C) 2019-2022 GoodData Corporation
import { sniffCapturings, visitDashboardAndWaitForFullRender } from "../support";
import { SIMPLE_DASHBOARD } from "../../src/plugins";

describe("Test Plugin", () => {
    sniffCapturings("test-plugin.spec");

    it("should add custom widget to dashboard", () => {
        visitDashboardAndWaitForFullRender(SIMPLE_DASHBOARD);
        cy.get(".s-custom-widget").should("exist");
    });
});
