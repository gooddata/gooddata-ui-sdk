// (C) 2023-2025 GoodData Corporation

import { EditMode } from "../../tools/editMode";
import { AttributeFilter } from "../../tools/filterBar";
import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const editMode = new EditMode();
const regionFilter = new AttributeFilter("Region");
const salesRepFilter = new AttributeFilter("Sales Rep");
const productFilter = new AttributeFilter("Product");
const statusFilter = new AttributeFilter("Status");

const getKPI = () => new Widget(0).waitKpiLoaded().getKPI();
const getTable = () => new Widget(1).waitTableLoaded().getTable();
const getChart = () => new Widget(2).waitChartLoaded().getChart();

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Single selection filters", () => {
    beforeEach(() => {
        Navigation.visit("dashboard/single-select-filter-integration");
    });

    it(
        "should affect widgets on selection changes in view mode",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            editMode.isInEditMode(false);

            getKPI().hasValue("$1,002,362.10");
            getTable().hasCellValue(0, 1, "John Jovi");
            getChart().hasDataLabelValues(["$1,002,362.10"]);

            regionFilter
                .hasSubtitle("West Coast")
                .open()
                .searchAndSelectFilterItem("East Coast")
                .hasSubtitle("East Coast");

            getKPI().hasValue("$2,613,384.82");
            getTable().hasCellValue(0, 1, "Alejandro Vabiano");
            getChart().hasDataLabelValues(["$987,286.48", "$1,626,098.34"]);
        },
    );

    it(
        "should change multiple selection with all values to single selection (auto-select first)",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            editMode.isInEditMode(false).edit().isInEditMode(true);

            getKPI().hasValue("$1,002,362.10");
            getTable().hasCellValue(1, 3, "Open");
            getChart().hasDataLabelValues(["$1,002,362.10"]);

            statusFilter
                .isLoaded()
                .hasSubtitle("All")
                .open()
                .isValueSelected("Lost", true)
                .isValueSelected("Open", true)
                .isValueSelected("Won", true)
                .changeSelectionMode("single")
                .isLoaded()
                .hasSubtitle("Lost")
                .isValueSelected("Lost", true)
                .isValueSelected("Open", false)
                .isValueSelected("Won", false)
                .close();

            getKPI().hasValue("$173,309.87");
            getTable().hasCellValue(1, 3, "Lost");
            getChart().hasDataLabelValues(["$173,309.87"]);
        },
    );

    it(
        "should change positive multiple selection with some values to single selection (auto-select first)",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            editMode.isInEditMode(false).edit().isInEditMode(true);

            getKPI().hasValue("$1,002,362.10");
            getTable().hasCellValue(0, 1, "John Jovi");
            getChart().hasDataLabelValues(["$1,002,362.10"]);

            salesRepFilter
                .isLoaded()
                .hasSubtitle("Alejandro Vabiano, Alexsandr Fyodr, John Jovi")
                .open()
                .isValueSelected("Adam Bradley", false)
                .isValueSelected("John Jovi", true)
                .changeSelectionMode("single")
                .isLoaded()
                .hasSubtitle("Adam Bradley")
                .isValueSelected("Adam Bradley", true)
                .isValueSelected("John Jovi", false)
                .close();

            getKPI().hasValue("–");
            new Widget(1).hasNoDataForFilter();
            new Widget(2).hasNoDataForFilter();
        },
    );

    it(
        "should change negative multiple selection with some values to single selection (auto-select first)",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            editMode.isInEditMode(false).edit().isInEditMode(true);

            getKPI().hasValue("$1,002,362.10");
            getTable().hasCellValue(0, 2, "Grammar Plus");
            getChart().hasDataLabelValues(["$1,002,362.10"]);

            productFilter
                .isLoaded()
                .hasSubtitle("All except CompuSci, Educationly, Explorer")
                .open()
                .isValueSelected("CompuSci", false)
                .isValueSelected("Educationly", false)
                .isValueSelected("Explorer", false)
                .changeSelectionMode("single")
                .isLoaded()
                .hasSubtitle("CompuSci")
                .isValueSelected("CompuSci", true)
                .isValueSelected("Educationly", false)
                .isValueSelected("Explorer", false)
                .close();

            getKPI().hasValue("$979,961.64");
            getTable().hasCellValue(0, 2, "CompuSci");
            getChart().hasDataLabelValues(["$979,961.64"]);
        },
    );

    it(
        "should change single selection to multiple selection (auto-select all)",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            editMode.isInEditMode(false).edit().isInEditMode(true);

            regionFilter.open().searchAndSelectFilterItem("West Coast");

            getKPI().hasValue("$1,002,362.10");
            getTable().hasCellValue(0, 0, "West Coast");
            getChart().hasDataLabelValues(["$1,002,362.10"]);

            regionFilter
                .isLoaded()
                .hasSubtitle("West Coast")
                .open()
                .clearSearch()
                .isValueSelected("East Coast", false)
                .isValueSelected("West Coast", true)
                .changeSelectionMode("multi")
                .isLoaded()
                .hasSubtitle("All")
                .isValueSelected("East Coast", true)
                .isValueSelected("West Coast", true)
                .close();

            getKPI().hasValue("$3,615,746.92");
            getTable().hasCellValue(0, 0, "East Coast");
            getChart().hasDataLabelValues(["$987,286.48", "$1,626,098.34", "$1,002,362.10"]);
        },
    );

    it(
        "should not allow combining single selection mode with parent filter, choosing one disables another",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            editMode.isInEditMode(false).edit().isInEditMode(true);
            salesRepFilter
                .open()
                .selectConfiguration()

                .toggleSelectionModeDropdown()
                .hasSelectionMode("multi", true)
                .hasSelectionMode("single", false)
                .hasSingleSelectionModeEnabled(true)
                .hasBearFilterDependencyEnabled(true)

                .clickSelectionMode("single")

                .toggleSelectionModeDropdown()
                .hasSelectionMode("multi", false)
                .hasSelectionMode("single", true)
                .hasSingleSelectionModeEnabled(true)
                .hasBearFilterDependencyEnabled(false)

                .clickSelectionMode("multi")

                .toggleSelectionModeDropdown()
                .hasSelectionMode("multi", true)
                .hasSelectionMode("single", false)
                .hasSingleSelectionModeEnabled(true)
                .hasBearFilterDependencyEnabled(true)

                .checkBearFilterDependency("Region")

                .toggleSelectionModeDropdown()
                .hasSelectionMode("multi", true)
                .hasSelectionMode("single", false)
                .hasSingleSelectionModeEnabled(false)
                .hasBearFilterDependencyEnabled(true)

                .saveConfiguration()
                .close();
        },
    );

    it(
        "should reset child filter to 'All' on single selection mode parent changes its selection",
        { tags: ["pre-merge_isolated_bear"] },
        () => {
            editMode.isInEditMode(false).edit().isInEditMode(true);

            getKPI().hasValue("$1,002,362.10");
            getTable().hasCellValue(0, 1, "John Jovi");
            getChart().hasDataLabelValues(["$1,002,362.10"]);

            salesRepFilter
                .open()
                .hasSubtitle("Alejandro Vabiano, Alexsandr Fyodr, John Jovi")
                .hasFilterListSize(20)
                .selectConfiguration()
                .toggleSelectionModeDropdown()
                .hasSelectionMode("multi", true)
                .hasSelectionMode("single", false)
                .checkBearFilterDependency("Region")
                .saveConfiguration()
                .hasSubtitle("Alejandro Vabiano, Alexsandr Fyodr, John Jovi")
                .hasFilterListSize(11)
                .close();

            getKPI().hasValue("$1,002,362.10");
            getTable().hasCellValue(0, 1, "John Jovi");
            getChart().hasDataLabelValues(["$1,002,362.10"]);

            regionFilter
                .open()
                .hasSubtitle("West Coast")
                .searchAndSelectFilterItem("East Coast")
                .hasSubtitle("East Coast");

            salesRepFilter
                .open()
                .hasSubtitle("All")
                .hasFilterListSize(9)
                .selectConfiguration()
                .toggleSelectionModeDropdown()
                .hasSelectionMode("multi", true)
                .hasSelectionMode("single", false)
                .closeConfiguration()
                .close();

            getKPI().hasValue("$8,033,881.73");
            getTable().hasCellValue(0, 1, "Adam Bradley");
            getChart().hasDataLabelValues([
                "$1,363,291.33",
                "$987,286.48",
                "$1,626,098.34",
                "$641,198.82",
                "$937,501.20",
                "$684,916.07",
                "$552,756.88",
                "$792,245.05",
                "$448,587.56",
            ]);

            salesRepFilter.open().selectAttribute(["Alejandro Vabiano"]).apply();

            getKPI().hasValue("$987,286.48");
            getTable().hasCellValue(0, 1, "Alejandro Vabiano");
            getChart().hasDataLabelValues(["$987,286.48"]);
        },
    );
});
