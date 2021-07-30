// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Dashboard", () => {
    describe("TopBar rendering", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard");
        });

        it("should render topBar", () => {
            const dashboard = new Dashboard("FullDashboard");

            dashboard.getTopBarElement().should("exist");
        });

        it("should render title", () => {
            const topBar = new TopBar();

            topBar.getDashboardTitleElement().should("exist");
            topBar.getDashboardTitleElement().should("have.text", "E2E RAIL Tests");
        });

        it("should not render edit button", () => {
            const topBar = new TopBar();
            const dashboard = new Dashboard("FullDashboard");

            dashboard.getTopBarElement().should("exist");

            topBar.getEditButtonElement().should("not.exist");
        });

        it("should menu button render", () => {
            const topBar = new TopBar();

            topBar.getMenuButtonElement().should("exist");
        });

        it("should open menu button and contain items", () => {
            const topBar = new TopBar();

            const menuButtonElement = topBar.getMenuButtonElement();

            menuButtonElement.should("exist");
            menuButtonElement.click();

            topBar.getMenuButtonItemElement("s-export_to_pdf").should("exist");
            topBar.getMenuButtonItemElement("s-schedule_emailing").should("exist");
        });
    });

    describe("FilterBar rendering", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard");
        });

        it("should render filter bar", () => {
            const dashboard = new Dashboard("FullDashboard");

            dashboard.getFilterBarElement().should("exist");
        });

        it("should render date filter", () => {
            const filterBar = new FilterBar();

            filterBar.getDateFilterElement().should("exist");

            filterBar.getDateFilterTitleElement().should("have.text", "Date range");

            filterBar.getDateFilterElement().click();

            filterBar.getDateFilterBodyElement("s-all-time").should("exist");
            filterBar.getDateFilterBodyElement("s-exclude-current-perod-disabled").should("exist");
            filterBar.getDateFilterBodyElement("s-date-filter-cancel").should("exist");
            filterBar.getDateFilterBodyElement("s-date-filter-apply").should("exist");
        });

        it("should change the filter", () => {
            const filterBar = new FilterBar();

            filterBar.getDateFilterElement().should("exist");
            filterBar.getDateFilterSubtitleElement().should("have.text", "All time");
            filterBar.getDateFilterElement().click();
            filterBar.getDateFilterBodyElement("s-relative-preset-relative-last-7-days").click();
            filterBar.getDateFilterBodyElement("s-date-filter-apply").click();
            filterBar.getDateFilterSubtitleElement().should("have.text", "Last 7 days");
        });
    });

    describe("Dashboard body rendering", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard");
        });

        it("should render single insight", () => {
            const dashboard = new Dashboard("FullDashboard");

            dashboard.getDashboardBody().should("exist");
        });
    });
});
