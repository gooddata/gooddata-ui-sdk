// (C) 2019-2022 GoodData Corporation
import { getDashboardUrl } from "../support";
import { SIMPLE_DASHBOARD } from "../../src/plugins";
import { CapturedDataSniffer } from "../support/index";

describe("Test Plugin", () => {
    if (Cypress.env("capturing")) {
        const capturedDataSniffer = new CapturedDataSniffer("test-plugin.spec");

        afterEach(() => {
            capturedDataSniffer.sniffCapturedData();
        });

        after(() => {
            capturedDataSniffer.commitCapturedData();
        });
    }

    it("should add custom widget to dashboard", () => {
        cy.visit(getDashboardUrl(SIMPLE_DASHBOARD));
        cy.get(".s-custom-widget").should("exist");
    });
});
