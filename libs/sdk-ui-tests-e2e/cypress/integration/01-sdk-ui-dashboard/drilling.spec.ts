// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Drilling", () => {
    describe("implicit drill to attribute url", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("implicit-drill-to-attribute-url");
        });

        it("should drill to correct url after clicking on attribute", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://financial-services-gd.com/devops/?page=server_detail&id=27564&name=Aaron%20Clements",
            );
        });

        it("should drill to correct url after clicking on attribute in drill modal", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 1);

            const drillModalTable = new Table(".s-drill-modal-dialog");

            drillModalTable.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://financial-services-gd.com/devops/?page=server_detail&id=27564&name=Aaron%20Clements",
            );
        });
    });
});
