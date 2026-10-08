// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboardFilterReference,
    type IInsightWidget,
    type ObjRef,
    idRef,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { SimpleDashboardLayout } from "../../tests/SimpleDashboard.test.helpers.js";

import { resolveWidgetDashboardFilters } from "./widgetFilters.js";

const baseWidget = SimpleDashboardLayout.sections[1].items[0].widget as IInsightWidget;

const COMMON_DATASET = idRef("dt_common", "dataSet");
const DIMENSION_DATASET = idRef("dt_dimension", "dataSet");
const DEPARTMENT = idRef("department", "displayForm");
const DEPARTMENT_LINK = idRef("department_link", "displayForm");
const REGION = idRef("region", "displayForm");
const AMOUNT = idRef("amount", "measure");
const WON = idRef("won", "measure");

const commonDateFilter = newRelativeDateFilter(COMMON_DATASET, "GDC.time.month", -3, 0);
const dimensionDateFilter = newRelativeDateFilter(DIMENSION_DATASET, "GDC.time.year", -1, 0);
const departmentFilter = newPositiveAttributeFilter(DEPARTMENT, ["1226"], "department-filter");
const regionFilter = newPositiveAttributeFilter(REGION, ["west"], "region-filter");
const amountFilter = newMeasureValueFilter(AMOUNT, "GREATER_THAN", 10);
const wonFilter = newMeasureValueFilter(WON, "GREATER_THAN", 5);

function widgetWith(dateDataSet: ObjRef | undefined, ignoreDashboardFilters: IDashboardFilterReference[]) {
    return { ...baseWidget, dateDataSet, ignoreDashboardFilters };
}

function resolve(
    widget: IInsightWidget,
    displayAsLabelMap = new Map<string, ObjRef>(),
    insightFilters: Parameters<typeof resolveWidgetDashboardFilters>[3] = [],
) {
    return resolveWidgetDashboardFilters(
        widget,
        [[commonDateFilter], [dimensionDateFilter, departmentFilter, regionFilter, amountFilter, wonFilter]],
        displayAsLabelMap,
        insightFilters,
    );
}

describe("resolveWidgetDashboardFilters", () => {
    it("should apply the common date filter only to a widget with that date dataset", () => {
        expect(resolve(widgetWith(COMMON_DATASET, [])).dateFilters.map(({ filter }) => filter)).toEqual([
            commonDateFilter,
            dimensionDateFilter,
        ]);
        expect(resolve(widgetWith(undefined, [])).dateFilters.map(({ filter }) => filter)).toEqual([
            dimensionDateFilter,
        ]);
    });

    it("should drop a date filter whose date dataset the widget ignores", () => {
        const widget = widgetWith(COMMON_DATASET, [
            { type: "dateFilterReference", dataSet: DIMENSION_DATASET },
        ]);

        expect(resolve(widget).dateFilters.map(({ filter }) => filter)).toEqual([commonDateFilter]);
    });

    it("should drop an attribute filter the widget ignores by its display form", () => {
        const widget = widgetWith(undefined, [{ type: "attributeFilterReference", displayForm: DEPARTMENT }]);

        expect(resolve(widget).attributeFilters).toEqual([regionFilter]);
    });

    it("should drop an attribute filter the widget ignores by its display-as label", () => {
        const widget = widgetWith(undefined, [
            { type: "attributeFilterReference", displayForm: DEPARTMENT_LINK },
        ]);
        const displayAsLabelMap = new Map([["department-filter", DEPARTMENT_LINK]]);

        expect(resolve(widget).attributeFilters).toEqual([departmentFilter, regionFilter]);
        expect(resolve(widget, displayAsLabelMap).attributeFilters).toEqual([regionFilter]);
    });

    it("should drop a measure value filter the widget ignores", () => {
        const widget = widgetWith(undefined, [{ type: "measureValueFilterReference", measure: AMOUNT }]);

        expect(resolve(widget).measureValueFilters).toEqual([wonFilter]);
    });

    it("should drop all measure value filters when the insight has a ranking filter", () => {
        const rankingFilter = newRankingFilter(AMOUNT, [REGION], "TOP", 3);

        expect(resolve(widgetWith(undefined, []), undefined, [rankingFilter]).measureValueFilters).toEqual(
            [],
        );
    });
});
