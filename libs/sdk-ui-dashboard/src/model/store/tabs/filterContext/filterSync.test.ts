// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { type ITabState } from "../tabsState.js";

import { type FilterContextState, type WorkingFilterContextItem } from "./filterContextState.js";
import { seedSyncedTabFilters } from "./filterSync.js";

const displayForm = idRef("region.name", "displayForm");
const otherDisplayForm = idRef("region.code", "displayForm");
const dataSet = idRef("created", "dataSet");
const measure = idRef("amount", "measure");

function displayFormMeta(
    id: string,
    attributeId: string,
    attributeType: "attribute" | "computedAttribute" = "attribute",
): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        id,
        uri: `/${id}`,
        ref: idRef(id, "displayForm"),
        title: id,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: idRef(attributeId, attributeType),
    };
}

function attributeFilter(
    localIdentifier: string,
    form: typeof displayForm,
    uris: string[],
): IDashboardAttributeFilter {
    return {
        attributeFilter: {
            displayForm: form,
            negativeSelection: false,
            attributeElements: { uris },
            localIdentifier,
        },
    };
}

function dateFilter(localIdentifier: string, from: number): IDashboardDateFilter {
    return {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.date",
            dataSet,
            localIdentifier,
            from,
            to: 0,
        },
    };
}

function measureFilter(
    localIdentifier: string,
    value: number,
    dimensionality?: ObjRef[],
): IDashboardMeasureValueFilter {
    return {
        dashboardMeasureValueFilter: {
            measure,
            localIdentifier,
            conditions: [{ comparison: { operator: "GREATER_THAN", value } }],
            ...(dimensionality?.length ? { dimensionality } : {}),
        },
    };
}

function filterContext(
    filters: FilterContextItem[],
    working: WorkingFilterContextItem[] = [],
    original?: FilterContextItem[],
): FilterContextState {
    return {
        filtersWithInvalidSelection: [],
        filterContextDefinition: { title: "", description: "", filters },
        workingFilterContextDefinition: { filters: working },
        ...(original
            ? { originalFilterContextDefinition: { title: "", description: "", filters: original } }
            : {}),
    };
}

describe("seedSyncedTabFilters", () => {
    const base = { title: "filterContext", description: "", filters: [] };

    it("copies applied filters and their configs, leaving out working values and cross-filtering filters", () => {
        const source: ITabState = {
            localIdentifier: "tab-a",
            filterContext: {
                ...filterContext(
                    [
                        attributeFilter("region", displayForm, ["east"]),
                        attributeFilter("cross", otherDisplayForm, ["x"]),
                        dateFilter("created", -7),
                        measureFilter("mvf", 10),
                    ],
                    [attributeFilter("region", displayForm, ["west"])],
                ),
                attributeFilterDisplayForms: [displayFormMeta("region.name", "region")],
            },
            attributeFilterConfigs: {
                attributeFilterConfigs: [
                    { localIdentifier: "region", mode: "readonly" },
                    { localIdentifier: "cross", mode: "hidden" },
                ],
            },
            dateFilterConfigs: {
                dateFilterConfigs: [
                    { dateDataSet: dataSet, config: { filterName: "Created", mode: "active" } },
                    {
                        dateDataSet: idRef("closed", "dataSet"),
                        config: { filterName: "Closed", mode: "active" },
                    },
                ],
            },
            measureValueFilterConfigs: {
                measureValueFilterConfigs: [{ localIdentifier: "mvf", mode: "readonly" }],
            },
            filterGroupsConfig: {
                groups: [
                    {
                        title: "Mixed",
                        filters: [{ filterLocalIdentifier: "region" }, { filterLocalIdentifier: "cross" }],
                    },
                    { title: "Cross only", filters: [{ filterLocalIdentifier: "cross" }] },
                ],
            },
        };

        const seed = seedSyncedTabFilters(source, base, { "tab-a": ["cross"] });

        expect(seed.filterContextDefinition).toEqual({
            ...base,
            filters: [
                attributeFilter("region", displayForm, ["east"]),
                dateFilter("created", -7),
                measureFilter("mvf", 10),
            ],
        });
        expect(seed.attributeFilterDisplayForms).toEqual([displayFormMeta("region.name", "region")]);
        expect(seed.attributeFilterConfigs).toEqual([{ localIdentifier: "region", mode: "readonly" }]);
        expect(seed.dateFilterConfigs).toEqual([
            { dateDataSet: dataSet, config: { filterName: "Created", mode: "active" } },
        ]);
        expect(seed.measureValueFilterConfigs).toEqual([{ localIdentifier: "mvf", mode: "readonly" }]);
        expect(seed.filterGroupsConfig).toEqual({
            groups: [{ title: "Mixed", filters: [{ filterLocalIdentifier: "region" }] }],
        });
    });
});
