// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Dashboard } from "../../tools/dashboards";
import { Widget } from "../../tools/widget";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Dashboard with charts", { tags: ["pre-merge_isolated_tiger"] }, () => {
    describe("rendering", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard/dashboard-tiger-charts");
        });

        it("should render charts", () => {
            const dashboard = new Dashboard();
            dashboard.getWidgetList().should("contain", "Funnel chart");
            dashboard.getWidgetList().should("contain", "Pyramid chart");

            // the internals are already covered in storybook,
            // let's just check charts were rendered
            new Widget(0).getChart().isHighchartsChart();
            new Widget(1).getChart().isHighchartsChart();
        });
    });
});
