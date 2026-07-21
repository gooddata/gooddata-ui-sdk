// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { collectAvailableReferences, collectContextReferences } from "../collectContextReferences.js";

describe("collectContextReferences", () => {
    it("should return empty array if context is undefined", () => {
        expect(collectContextReferences(undefined)).toEqual([]);
    });

    it("should collect dashboard reference with idRef", () => {
        const context = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                    widgets: [],
                    filters: [],
                },
            },
        } as any;
        const result = collectContextReferences(context);
        expect(result).toEqual([
            {
                id: "dash1",
                ref: idRef("dash1"),
                type: "dashboard",
                where: "view.dashboard",
                title: "Dash 1",
                nesting: 0,
            },
        ]);
    });

    it("should collect dashboard reference with uriRef and no title", () => {
        const context = {
            view: {
                dashboard: {
                    ref: uriRef("/uri1"),
                    widgets: [],
                    filters: [],
                },
            },
        } as any;
        const result = collectContextReferences(context);
        expect(result).toEqual([
            {
                id: "/uri1",
                ref: uriRef("/uri1"),
                type: "dashboard",
                where: "view.dashboard",
                title: "/uri1",
                nesting: 0,
            },
        ]);
    });

    it("should return only one reference for ambient type", () => {
        const context = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                    widgets: [],
                    filters: [],
                },
            },
        } as any;
        const result = collectContextReferences(context);
        expect(result).toHaveLength(1);
        expect(result[0].ref).toEqual(idRef("dash1"));
    });

    it("should collect referenced objects", () => {
        const context = {
            referencedObjects: [
                {
                    context: {
                        ref: idRef("dash1"),
                        type: "DASHBOARD",
                    },
                    objects: [
                        {
                            ref: idRef("metric1"),
                            title: "Metric 1",
                            type: "METRIC",
                        },
                    ],
                },
            ],
        } as any;
        const result = collectContextReferences(context);
        expect(result).toEqual([
            {
                id: "metric1",
                ref: idRef("metric1"),
                type: "metric",
                where: "referencedObjects",
                title: "Metric 1",
                nesting: 1,
            },
        ]);
    });

    it("should sort references by nesting", () => {
        const context = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                },
            },
            referencedObjects: [
                {
                    objects: [
                        {
                            ref: idRef("metric1"),
                            title: "Metric 1",
                            type: "METRIC",
                        },
                    ],
                },
            ],
        } as any;
        const result = collectContextReferences(context);
        expect(result[0].nesting).toBe(0);
        expect(result[1].nesting).toBe(1);
    });
});

describe("collectAvailableReferences", () => {
    it("should return empty array if context is undefined", () => {
        expect(collectAvailableReferences(undefined)).toEqual([]);
    });

    it("should collect dashboard and its widgets", () => {
        const context = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                    widgets: [
                        {
                            widgetType: "insight",
                            widgetRef: idRef("insight1"),
                            title: "Insight 1",
                        },
                        {
                            widgetType: "visualizationSwitcher",
                            visualizations: [
                                {
                                    widgetRef: idRef("insight2"),
                                    title: "Insight 2",
                                },
                            ],
                        },
                    ],
                    filters: [],
                },
            },
        } as any;
        const result = collectAvailableReferences(context);
        expect(result).toEqual([
            {
                id: "dash1",
                ref: idRef("dash1"),
                type: "dashboard",
                where: "view.dashboard",
                title: "Dash 1",
                nesting: 0,
            },
            {
                id: "insight1",
                ref: idRef("insight1"),
                type: "widget",
                where: "referencedObjects",
                title: "Insight 1",
                nesting: 1,
                context: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                    type: "DASHBOARD",
                },
            },
            {
                id: "insight2",
                ref: idRef("insight2"),
                type: "widget",
                where: "referencedObjects",
                title: "Insight 2",
                nesting: 1,
                context: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                    type: "DASHBOARD",
                },
            },
        ]);
    });

    it("should deduplicate widgets with same ref", () => {
        const context = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    widgets: [
                        {
                            widgetType: "insight",
                            widgetRef: idRef("insight1"),
                            title: "Insight 1",
                        },
                        {
                            widgetType: "insight",
                            widgetRef: idRef("insight1"),
                            title: "Insight 1 Duplicate",
                        },
                    ],
                },
            },
        } as any;
        const result = collectAvailableReferences(context);
        expect(result).toHaveLength(2); // dashboard + 1 unique insight
        expect(result[1].id).toBe("insight1");
    });
});
