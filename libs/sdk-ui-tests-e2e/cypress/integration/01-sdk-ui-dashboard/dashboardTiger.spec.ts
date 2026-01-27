// (C) 2021-2026 GoodData Corporation

import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";
import { EditMode } from "../../tools/editMode";
import { visit } from "../../tools/navigation";
import { TableNew } from "../../tools/tableNew";
import { Widget } from "../../tools/widget";
import { WidgetConfiguration } from "../../tools/widgetConfiguration";

const topBar = new TopBar();
const dashboard = new Dashboard();
const editMode = new EditMode();
const widget = new Widget(0);

const STAGE_NAME_CHECKBOX = ".s-stage_name";

describe("Dashboard", () => {
    describe(
        "TopBar rendering advanced",
        {
            tags: [
                "checklist_integrated_tiger_be",
                "checklist_integrated_tiger_fe",
                "checklist_integrated_tiger_releng_be",
                "checklist_integrated_tiger_releng_fe",
            ],
        },
        () => {
            //Cover ticket: RAIL-4702
            it("Should enable Save button when resize column", () => {
                visit("dashboard/stage-name");
                editMode.edit();
                const table = new TableNew(".s-dash-item");
                table.waitLoaded().resizeColumn(0, 1, 500, true);
                editMode.saveButtonEnabled(true);
            });

            //Cover ticket: RAIL-4728
            it("Should reload widget after check/uncheck attribute filter", () => {
                const widgetConfig = new WidgetConfiguration(0);

                visit("dashboard/stage-name");
                editMode.edit();
                widget.waitTableLoaded().focus();
                widgetConfig.openConfiguration().selectFilterCheckbox(STAGE_NAME_CHECKBOX);
                widget.waitTableLoaded();
                widgetConfig.selectFilterCheckbox(STAGE_NAME_CHECKBOX);
                widget.waitTableLoaded();
            });
        },
    );
    describe("TopBar rendering", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
        beforeEach(() => {
            visit("dashboard/dashboard-tiger");
        });

        it("should render topBar", () => {
            dashboard.topBarExist();
        });

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

        it.skip("should open menu button and contain items", () => {
            topBar
                .menuButtonIsVisible()
                .clickMenuButton()
                .topBarMenuItemExist(".s-export_to_pdf")
                .topBarMenuItemExist(".s-schedule_emailing");
        });
    });

    describe("FilterBar rendering", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
        beforeEach(() => {
            visit("dashboard/dashboard-tiger");
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

    describe("Dashboard body rendering", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
        beforeEach(() => {
            visit("dashboard/kpis");
        });

        it.skip("should render single insight", () => {
            dashboard.dashboardBodyExist();
        });
    });

    describe("Dashboard has too many data points insight", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
        beforeEach(() => {
            visit("dashboard/manydata");
        });

        it("should render insight", () => {
            new Widget(0).getChart().isHighchartsChart();
        });
    });
});
