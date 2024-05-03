// (C) 2021-2024 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";
import { EditMode } from "../../tools/editMode";
import { Widget } from "../../tools/widget";
import { WidgetConfiguration } from "../../tools/widgetConfiguration";
import { Table } from "../../tools/table";

const topBar = new TopBar();
const dashboard = new Dashboard();
const editMode = new EditMode();
const widget = new Widget(0);

const STAGE_NAME_CHECKBOX = ".s-stage_name";

describe("Dashboard", () => {
    describe("TopBar rendering advanced", { tags: ["checklist_integrated_tiger"] }, () => {
        //Cover ticket: RAIL-4702
        it("Should enable Save button when resize column", () => {
            Navigation.visit("dashboard/stage-name");
            editMode.edit();
            const table = new Table(".s-dash-item");
            table.waitLoaded().resizeColumn(0, 1, 500, true);
            editMode.saveButtonEnabled(true);
        });

        //Cover ticket: RAIL-4728
        it("Should reload widget after check/uncheck attribute filter", () => {
            const widgetConfig = new WidgetConfiguration(0);

            Navigation.visit("dashboard/stage-name");
            editMode.edit();
            widget.waitTableLoaded().focus();
            widgetConfig.openConfiguration().selectFilterCheckbox(STAGE_NAME_CHECKBOX);
            widget.isLoading(true);
            widgetConfig.selectFilterCheckbox(STAGE_NAME_CHECKBOX);
            widget.isLoading(true);
        });
    });
    describe("TopBar rendering", { tags: ["pre-merge_isolated_tiger"] }, () => {
        beforeEach(() => {
            Navigation.visit("dashboard/dashboard-tiger");
        });

        it("should render topBar", () => {
            dashboard.topBarExist();
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should render title", () => {
            topBar.dashboardTitleExist().dashboardTitleHasValue("KPIs");
        });

        it("should render edit button", () => {
            dashboard.topBarExist();
            topBar.editButtonIsVisible(true);
        });

        it("should menu button render", () => {
            topBar.menuButtonIsVisible();
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should open menu button and contain items", () => {
            topBar
                .menuButtonIsVisible()
                .clickMenuButton()
                .topBarMenuItemExist(".s-export_to_pdf")
                .topBarMenuItemExist(".s-schedule_emailing");
        });
    });

    describe("FilterBar rendering", { tags: ["pre-merge_isolated_tiger"] }, () => {
        beforeEach(() => {
            Navigation.visit("dashboard/dashboard-tiger");
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

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should change the filter", () => {
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

    describe("Dashboard body rendering", { tags: ["pre-merge_isolated_tiger"] }, () => {
        beforeEach(() => {
            Navigation.visit("dashboard/kpis");
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should render single insight", () => {
            dashboard.dashboardBodyExist();
        });
    });

    describe("Dashboard has too many data points insight", { tags: ["pre-merge_isolated_tiger"] }, () => {
        beforeEach(() => {
            Navigation.visit("dashboard/manydata");
        });

        it("should render insight", () => {
            new Widget(0).getChart().isHighchartsChart();
        });
    });
});
