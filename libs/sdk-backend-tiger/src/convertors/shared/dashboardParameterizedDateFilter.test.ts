// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DashboardParameterizedDateFilter } from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    idRef,
    newAllTimeDashboardDateFilter,
    newDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { convertFilterContextFilters } from "../fromBackend/analyticalDashboards/v2/FilterContextFiltersConverter.js";
import { convertFilterContextToBackend } from "../toBackend/AnalyticalDashboardConverter.js";

import { convertSdkFiltersToTiger, convertTigerToSdkFilters } from "./storedFilterConverter.js";

const parameter = idRef("period", "parameter");

const withDataSet = newDashboardParameterizedDateFilter(parameter, {
    dataSet: idRef("closed", "dataSet"),
    localIdentifier: "closedPeriod",
    emptyValueHandling: "include",
});

const tigerWithDataSet: DashboardParameterizedDateFilter = {
    dashboardParameterizedDateFilter: {
        parameter: { identifier: { id: "period", type: "parameter" } },
        dataSet: { identifier: { id: "closed", type: "dataset" } },
        localIdentifier: "closedPeriod",
        emptyValueHandling: "include",
    },
};

const filterContextItems: FilterContextItem[] = [
    newAllTimeDashboardDateFilter(undefined, "commonDate"),
    {
        attributeFilter: {
            displayForm: idRef("label.region", "displayForm"),
            negativeSelection: false,
            attributeElements: { values: ["West"] },
            localIdentifier: "region",
            selectionMode: "multi",
        },
    },
    newDashboardParameterizedDateFilter(parameter, { localIdentifier: "commonPeriod" }),
    withDataSet,
];

describe("parameterized date filter in the filter context", () => {
    it("is stored under dashboardParameterizedDateFilter", () => {
        expect(convertSdkFiltersToTiger([withDataSet])).toEqual([tigerWithDataSet]);
    });

    it("is read from dashboardParameterizedDateFilter", () => {
        expect(convertTigerToSdkFilters([tigerWithDataSet])).toEqual([withDataSet]);
    });

    it("is written and read back next to the other filter context items", () => {
        expect(convertTigerToSdkFilters(convertSdkFiltersToTiger(filterContextItems))).toEqual(
            filterContextItems,
        );
    });

    it("gets a local identifier when the dashboard filter context is saved", () => {
        const saved = convertFilterContextToBackend({
            title: "filterContext",
            description: "",
            filters: [newDashboardParameterizedDateFilter("period")],
        });

        expect(saved.filters).toEqual([
            {
                dashboardParameterizedDateFilter: {
                    parameter: { identifier: { id: "period", type: "parameter" } },
                    localIdentifier: "0_dateFilter",
                },
            },
        ]);
    });

    it("survives a round trip through the dashboard filter context", () => {
        const saved = convertFilterContextToBackend({
            title: "filterContext",
            description: "",
            filters: filterContextItems,
        });

        expect(convertFilterContextFilters(saved)).toEqual(filterContextItems);
    });
});
