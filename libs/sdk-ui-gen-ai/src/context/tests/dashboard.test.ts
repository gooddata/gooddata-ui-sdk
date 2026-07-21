// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, serializeObjRef } from "@gooddata/sdk-model";

import {
    buildDashboardContext,
    buildFiltersContext,
    buildWidgetContext,
    buildWidgetsContext,
} from "../dashboard.js";

describe("buildDashboardContext", () => {
    it("should return context with dashboard", () => {
        const dashboard = {
            ref: idRef("dash"),
            title: "Dash",
            widgets: [],
            filters: [],
        } as any;
        const result = buildDashboardContext(dashboard);
        expect(result).toEqual({ view: { dashboard } });
    });
});

describe("buildWidgetContext", () => {
    it("should return widget descriptor", () => {
        const result = buildWidgetContext("Title", idRef("w1"), "insight", { resultId: "res1" });
        expect(result).toEqual({
            title: "Title",
            widgetRef: idRef("w1"),
            widgetType: "insight",
            resultId: "res1",
        });
    });
});

describe("buildFiltersContext", () => {
    it("should convert attribute filters", () => {
        const filters = [
            {
                attributeFilter: {
                    displayForm: idRef("df1"),
                    negativeSelection: false,
                    attributeElements: { uris: ["/uri1"] },
                    title: "Attr",
                },
            },
        ] as any;
        const result = buildFiltersContext(filters);
        expect(result).toEqual([
            {
                type: "attribute_filter",
                using: "df1",
                state: { include: ["/uri1"] },
                title: "Attr",
            },
        ]);
    });

    it("should convert absolute date filters", () => {
        const filters = [
            {
                dateFilter: {
                    type: "absolute",
                    from: "2023-01-01",
                    to: "2023-01-31",
                    dataSet: idRef("ds1"),
                    localIdentifier: "df1",
                },
            },
        ] as any;

        const result = buildFiltersContext(filters);
        expect(result).toEqual([
            {
                type: "date_filter",
                using: "ds1",
                from: "2023-01-01",
                to: "2023-01-31",
                title: "01/01/2023 – 01/31/2023",
            },
        ]);
    });

    it("should convert relative date filters", () => {
        const filters = [
            {
                dateFilter: {
                    type: "relative",
                    from: 0,
                    to: 0,
                    granularity: "GDC.time.month",
                    localIdentifier: "df2",
                },
            },
        ] as any;
        const result = buildFiltersContext(filters);
        expect(result).toEqual([
            {
                type: "date_filter",
                using: undefined,
                from: 0,
                to: 0,
                granularity: "MONTH",
                title: "This month",
            },
        ]);
    });
});

describe("buildWidgetsContext", () => {
    it("should convert widgets and identify referenced objects", () => {
        const widgetsMap = new Map([
            [idRef("w1"), { type: "insight", title: "W1", ref: idRef("w1"), insight: idRef("i1") }],
            [idRef("w2"), { type: "richText", title: "W2", ref: idRef("w2"), content: "text" }],
        ]) as any;
        const resultsIdMap = new Map([[serializeObjRef(idRef("w1")), "res1"]]) as any;

        const result = buildWidgetsContext(widgetsMap, resultsIdMap);
        expect(result.widgets).toHaveLength(2);
        expect(result.widgets[0]).toMatchObject({ title: "W1", resultId: "res1" });
        expect(result.widgets[1]).toMatchObject({ title: "W2", content: "text" });
        expect(result.referencedObjects).toEqual([{ type: "WIDGET", ref: idRef("w1"), title: "W1" }]);
    });

    it("should handle visualization switcher and ignore its child insights", () => {
        const w1Ref = idRef("w1");
        const w1ChildRef = idRef("w1c");
        const widgetsMap = new Map([
            [
                w1Ref,
                {
                    type: "visualizationSwitcher",
                    title: "Switcher",
                    ref: w1Ref,
                    visualizations: [{ ref: w1ChildRef, insight: idRef("i1") }],
                },
            ],
            [w1ChildRef, { type: "insight", title: "Child", ref: w1ChildRef, insight: idRef("i1") }],
        ]) as any;

        const result = buildWidgetsContext(widgetsMap);
        expect(result.widgets).toHaveLength(1);
        expect(result.widgets[0].widgetType).toBe("visualizationSwitcher");
        expect(result.referencedObjects).toEqual([{ type: "WIDGET", ref: w1Ref, title: "Switcher" }]);
    });
});
