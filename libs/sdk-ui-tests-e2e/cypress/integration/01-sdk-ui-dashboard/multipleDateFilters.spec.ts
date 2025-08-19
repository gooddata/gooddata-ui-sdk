// (C) 2024-2025 GoodData Corporation
import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { DateFilter } from "../../tools/dateFilter";
import { EditMode } from "../../tools/editMode";
import { FilterBar } from "../../tools/filterBar";
import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { WidgetConfiguration } from "../../tools/widgetConfiguration";

const widget = new Widget(0);
const filterBar = new FilterBar();
const editMode = new EditMode();
const dashboardHeader = new DashboardHeader();
const dashboardMenu = new DashboardMenu();
const dateFilter = new DateFilter();

describe("Multitple date filters basic cases", { tags: ["pre-merge_isolated_tiger"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/multiple-date-filters");
        widget.waitChartLoaded();
    });

    it("can add multiple date filters", () => {
        editMode.edit();

        filterBar.hasDateFilters(["Date range", "Activity", "Created"]);
        filterBar.addDate("Snapshot");
        filterBar.addDate("Timeline");
        filterBar.hasDateFilters(["Date range", "Activity", "Created", "Snapshot", "Timeline"]);
    });

    it("can select new filters via config panel without specifying date dataset", () => {
        editMode.edit();

        new WidgetConfiguration(0)
            .open()
            .openConfiguration()
            .isFilterItemVisible("Created")
            .isDateDatasetDropdownExist("Created", false)
            .isFilterItemVisible("Activity")
            .isDateDatasetDropdownExist("Activity", false);
    });

    it("can select default selection of filter in edit mode", () => {
        editMode.edit();

        filterBar.addDate("Snapshot").selectRelativePreset("this-year").apply();

        widget.hasNoDataForFilter();
    });

    it("can remove date filter for specified date dataset", () => {
        editMode.edit();

        filterBar.hasDateFilters(["Date range", "Activity", "Created"]);

        dateFilter.removeFilter(2);

        filterBar.hasDateFilters(["Date range", "Activity"]);

        dateFilter.removeFilter(1);

        filterBar.hasDateFilters(["Date range"]);
    });

    it("(SEPARATE) can perform common action when specific date filter is set", () => {
        dashboardMenu.toggle();
        dashboardHeader.saveAsNew("Clone");

        filterBar.getDateSubTitleViewMode("Activity").should("have.text", "All time");
    });
});
