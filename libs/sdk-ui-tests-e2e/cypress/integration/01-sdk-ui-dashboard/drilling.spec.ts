// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";
import { Widget } from "../../tools/widget";
import { DrillToModal } from "../../tools/drillToModal";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const drillModal = new DrillToModal();

beforeEach(() => {
    cy.login();
});

describe("Drilling", { tags: ["pre-merge_isolated_bear"] }, () => {
    describe("implicit drill to attribute url", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/implicit-drill-to-attribute-url");
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute in drill modal", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 1);

            const drillModalTable = new Table(".s-drill-modal-dialog");

            drillModalTable.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });
    });

    describe("Advanced drill down", () => {
        it("Drill down on column with one drillable on drill to insight", () => {
            Navigation.visit("dashboard/drill-to-insight");
            new Widget(2).getTable().click(0, 0);

            drillModal.getChart().clickSeriesPoint(0);
            drillModal
                .getTitleElement()
                .should("have.text", "Bar chart with measures and attribute › Direct Sales");
        });

        it("Drill down on table with one drillable on drill to insight", () => {
            Navigation.visit("dashboard/drill-to-insight");
            const chart = new Widget(3).getChart().scrollIntoView().waitLoaded();
            cy.wait(1000); // after scroll to chart, have to wait then click
            chart.clickSeriesPoint(0, 7);

            drillModal.getTable().click(0, 1);
            drillModal
                .getTitleElement()
                .should("have.text", "Table Activity by Year and Department › Inside Sales");
        });

        it("Drill down on table with invalid drill", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(0).getTable().waitLoaded().click(0, 1);

            drillModal.getModalText().should("have.text", "Sorry, we can't display this insight");
        });

        it("Drill down on column chart with invalid drill", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(1).getChart().waitLoaded().clickSeriesPoint(0, 0);

            drillModal.getModalText().should("have.text", "Sorry, we can't display this insight");
        });

        it("Check attribute value when drilling in bubble chart", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(2).getChart().scrollIntoView().waitComputed().clickSeriesPoint(1, 0);

            drillModal.getTable().getColumnValues(0).should("deep.equal", ["2011"]);
        });
    });
});
