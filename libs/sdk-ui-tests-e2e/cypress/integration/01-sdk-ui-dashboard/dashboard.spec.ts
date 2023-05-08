// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";
import { EditMode } from "../../tools/editMode";

const topBar = new TopBar();

describe("Dashboard", { tags: ["pre-merge_isolated_bear"] }, () => {
    describe("TopBar rendering", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/dashboard");
        });

        it("should render topBar", () => {
            const dashboard = new Dashboard();

            dashboard.topBarExist();
        });

        it("should render title", () => {
            topBar.dashboardTitleExist().dashboardTitleHasValue("Test dashboard");
        });

        it("should render edit button", () => {
            const dashboard = new Dashboard();

            dashboard.topBarExist();
            topBar.editButtonIsVisible();
        });

        it("should menu button render", () => {
            topBar.menuButtonIsVisible();
        });

        it("should open menu button and contain items", () => {
            topBar
                .menuButtonIsVisible()
                .clickMenuButton()
                .topBarMenuItemExist(".s-export_to_pdf")
                .topBarMenuItemExist(".s-schedule_emailing");
        });

        //Cover ticket: RAIL-4772
        it(
            "should able to delete dashboard after save as new",
            { tags: ["checklist_integrated_bear"] },
            () => {
                Navigation.visitCopyOf("dashboard/dashboard");

                new EditMode().edit();
                topBar
                    .menuButtonIsVisible(true)
                    .clickMenuButton()
                    .deleteDashboard(true)
                    .dashboardTitleHasValue("Untitled");
            },
        );
    });

    describe("FilterBar rendering", () => {
        beforeEach(() => {
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
            Navigation.visit("dashboard/dashboard");
        });

        it("should render single insight", () => {
            const dashboard = new Dashboard();

            dashboard.dashboardBodyExist();
        });
    });
});
