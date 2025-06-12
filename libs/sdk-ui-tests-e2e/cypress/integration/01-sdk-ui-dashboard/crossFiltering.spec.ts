// (C) 2023-2024 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { DrillToModal } from "../../tools/drillToModal";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import { EditMode } from "../../tools/editMode";

const drillModal = new DrillToModal();
const filterBar = new FilterBar();
const editMode = new EditMode();
const attributeFilterDepartment = new AttributeFilter("Department");
const firstWidget = new Widget(0);
const secondWidget = new Widget(1);

describe("Cross filtering", { tags: ["pre-merge_isolated_tiger"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/dashboard-cross-filtering");
    });

    it("should add virtual filter when cross-filtering in view mode", () => {
        filterBar.hasAttributeLength(0);
        firstWidget.waitChartLoaded().getChart().hasDataLabelValues(["$3,843,400.54", "$1,290,997.11"]);
        secondWidget.getTable().waitLoaded().hasCellValue(0, 1, "770,636,605.83");

        firstWidget.getChart().clickSeriesPoint(0);
        drillModal.selectCrossFiltering();
        attributeFilterDepartment.isLoaded();

        // New filter added, first widget ignores the new filter, second widget is filtered by the new filter
        filterBar.hasAttributeFiltersWithValue([["Department", "Direct Sales"]]);
        firstWidget
            .waitChartLoaded()
            .getChart()
            .hasDataLabelValues(["$3,843,400.54", "$1,290,997.11"])
            .seriesPointHasClass("gd-point-highlighted", 0);
        secondWidget.getTable().waitLoaded().hasCellValue(0, 1, "716,947,106.20");

        editMode.edit();
        filterBar.hasAttributeLength(0);
        secondWidget.getTable().waitLoaded().hasCellValue(0, 1, "770,636,605.83");
    });
});
