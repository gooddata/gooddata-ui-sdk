// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";
import { EditMode } from "../../tools/editMode";
import { DashboardHeader } from "../../tools/dashboardHeader";

const topBar = new TopBar();
const dashboardHeader = new DashboardHeader();

describe("Dashboard", { tags: ["pre-merge_isolated_bear"] }, () => {
    describe("TopBar rendering", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/kpis");
        });

        it("should render topBar", () => {
            const dashboard = new Dashboard();

            dashboard.topBarExist();
        });

        it("should render title", () => {
            dashboardHeader.dashboardTitleExist().dashboardTitleHasValue("KPIs");
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
    });

    describe("FilterBar rendering", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/kpis");
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
                .dateFilterHasSubtitle("01/01/2011 – 12/31/2011")
                .clickDateFilter()
                .selectDateFilterOption(".s-relative-preset-relative-last-7-days")
                .clickApply()
                .dateFilterHasSubtitle("Last 7 days");
        });
    });

    describe("Dashboard body rendering", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/kpis");
        });

        it("should render single insight", () => {
            const dashboard = new Dashboard();

            dashboard.dashboardBodyExist();
        });
    });
});

describe("Dashboard actions", () => {
    //Cover ticket: RAIL-4772
    it(
        "should able to delete dashboard after save as new",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_bear"] },
        () => {
            Navigation.visitCopyOf("dashboard/kpis");

            new EditMode().edit();
            new DashboardHeader()
                .menuButtonIsVisible(true)
                .clickMenuButton()
                .deleteDashboard(true)
                .dashboardTitleHasValue("Untitled");
        },
    );
});
