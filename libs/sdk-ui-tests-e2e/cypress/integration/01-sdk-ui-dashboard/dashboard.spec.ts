// (C) 2021-2025 GoodData Corporation

import { DashboardHeader } from "../../tools/dashboardHeader";
import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";
import { EditMode } from "../../tools/editMode";
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

const topBar = new TopBar();
const dashboardHeader = new DashboardHeader();

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Dashboard", { tags: ["pre-merge_isolated_bear"] }, () => {
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

        //Cover ticket: RAIL-4431
        it(
            "should display placeholder and focus title for new dashboard",
            { tags: ["checklist_integrated_tiger"] },
            () => {
                Navigation.visit("dashboard/new-dashboard");
                dashboardHeader.hasTitlePlaceholder();
                dashboardHeader.isTitleFocused();
            },
        );
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
    const editMode = new EditMode();
    //Cover ticket: RAIL-4772
    it(
        "should able to delete dashboard after save as new",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visitCopyOf("dashboard/kpis");

            editMode.edit();
            new DashboardHeader()
                .menuButtonIsVisible(true)
                .clickMenuButton()
                .deleteDashboard(true)
                .dashboardTitleHasValue("Untitled");
        },
    );

    //Cover ticket: RAIL-4642
    it(
        "should able to scroll vertical/ horizontal on widget",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            const table = new Table(".s-dash-item-0_0");

            Navigation.visit("dashboard/dashboard-many-rows-columns");
            editMode.edit();
            table.scrollTo("right").scrollVerticalTo("bottom");
        },
    );

    //Cover ticket: RAIL-4750
    it(
        "should direct to view mode after save as new",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visitCopyOf("dashboard/kpis");
            dashboardHeader.editButtonIsVisible(true).shareButtonExists(true);
        },
    );
});
