// (C) 2019-2022 GoodData Corporation
import { withTestConfig } from "../../tools/configure";
import { PLUGIN_8_8_0_CONFIG, PLUGIN_LATEST_CONFIG } from "../../support/constants";

// customize.layout().customizeFluidLayout()
function shouldAddCustomSection() {
    cy.get(".s-fluid-layout-row-title").first().should("have.text", "Section Added By Plugin");
}

describe("Layout", () => {
    describe("8.8.0", () => {
        beforeEach(() => {
            cy.login();
            withTestConfig(PLUGIN_8_8_0_CONFIG);
        });

        it("should cover layout API", () => {
            shouldAddCustomSection();
        });
    });

    describe("latest", () => {
        beforeEach(() => {
            cy.login();
            withTestConfig(PLUGIN_LATEST_CONFIG);
        });

        it("should cover layout API", () => {
            shouldAddCustomSection();
        });
    });
});
