// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Dashboard2", { tags: ["post-merge_integrated_bear"] }, () => {
    describe("TopBar rendering2", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard/dashboard");
        });

        it("should render topBar2", () => {
            const dashboard = new Dashboard();

            dashboard.topBarExist();
        });
    });
});

describe("Dashboard", { tags: ["pre-merge_isolated_bear"] }, () => {
    describe("TopBar rendering", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard/dashboard");
        });

        it("should render topBar", () => {
            const dashboard = new Dashboard();

            dashboard.topBarExist();
        });

        it("should render title", () => {
            const topBar = new TopBar();

            topBar.dashboardTitleExist().dashboardTitleHasValue("Test dashboard");
        });

        it("should not render edit button", () => {
            const topBar = new TopBar();
            const dashboard = new Dashboard();

            dashboard.topBarExist();
            topBar.editButtonIsVisible(false);
        });

        it("should menu button render", () => {
            const topBar = new TopBar();

            topBar.menuButtonIsVisible();
        });

        it("should open menu button and contain items", () => {
            const topBar = new TopBar();

            topBar
                .menuButtonIsVisible()
                .clickMenuButton()
                .topBarMenuItemExist(".s-export_to_pdf")
                .topBarMenuItemExist(".s-schedule_emailing");
        });
    });

    describe("FilterBar rendering", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard/dashboard");
        });

        it("should render filter bar", () => {
            const dashboard = new Dashboard();

            dashboard.filterBarExist();
        });

        it("should render date filter", () => {
            const filterBar = new FilterBar();

            filterBar
                .dateFilterExist()
                .dateFilterHasTitle("Date range")
                .clickDateFilter()
                .dateFilterHasElements([
                    ".s-all-time",
                    ".s-exclude-current-perod-disabled",
                    ".s-date-filter-cancel",
                    ".s-date-filter-apply",
                ]);
        });

        it("should change the filter", () => {
            const filterBar = new FilterBar();

            filterBar
                .dateFilterExist()
                .dateFilterHasSubtitle("All time")
                .clickDateFilter()
                .selectDateFilterOption(".s-relative-preset-relative-last-7-days")
                .clickApply()
                .dateFilterHasSubtitle("Last 7 days");
        });
    });

    describe("Dashboard body rendering", () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("dashboard/dashboard");
        });

        it("should render single insight", () => {
            const dashboard = new Dashboard();

            dashboard.dashboardBodyExist();
        });
    });
});
