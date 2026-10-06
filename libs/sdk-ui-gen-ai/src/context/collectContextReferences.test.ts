// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IGenAIUserContext, idRef, uriRef } from "@gooddata/sdk-model";

import { type SelectedContext } from "../types.js";

import { collectAvailableReferences, collectContextReferences } from "./collectContextReferences.js";

describe("collectContextReferences", () => {
    it("should return empty array if context is undefined", () => {
        expect(collectContextReferences(undefined, undefined)).toEqual([]);
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
        const selected = undefined;
        const result = collectContextReferences(context, selected);
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
        const selected = undefined;
        const result = collectContextReferences(context, selected);
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
        const selected = undefined;
        const result = collectContextReferences(context, selected);
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
        const selected = undefined;
        const result = collectContextReferences(context, selected);
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
                    context: {
                        title: "Dash 1",
                        type: "dashboard",
                        ref: idRef("dash1"),
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
        const selected = undefined;
        const result = collectContextReferences(context, selected);
        expect(result[0].nesting).toBe(0);
        expect(result[1].nesting).toBe(1);
    });

    it("should collect a report other than the ambient one", () => {
        const context: IGenAIUserContext = { view: { report: { ref: idRef("q2", "report"), title: "Q2" } } };
        const selected: SelectedContext = {
            activated: true,
            report: {
                id: "q1",
                ref: idRef("q1", "report"),
                title: "Q1",
                nesting: 0,
                type: "report",
                where: "view.report",
            },
        };

        expect(collectContextReferences(context, selected)).toEqual([
            {
                id: "q2",
                ref: idRef("q2", "report"),
                type: "report",
                where: "view.report",
                title: "Q2",
                nesting: 0,
            },
        ]);
    });

    it("should collect a report that is not saved yet", () => {
        const context: IGenAIUserContext = { view: { report: { title: "Draft" } } };

        expect(collectContextReferences(context, undefined)).toEqual([
            { id: "unsaved", type: "report", where: "view.report", title: "Draft", nesting: 0 },
        ]);
    });

    it("should skip the ambient report when it is not saved yet", () => {
        const context: IGenAIUserContext = { view: { report: { title: "Draft" } } };
        const selected: SelectedContext = {
            activated: true,
            report: { id: "unsaved", title: "Draft", nesting: 0, type: "report", where: "view.report" },
        };

        expect(collectContextReferences(context, selected)).toEqual([]);
    });

    it("should skip the ambient report", () => {
        const ref = idRef("q1", "report");
        const context: IGenAIUserContext = { view: { report: { ref, title: "Q1" } } };
        const selected: SelectedContext = {
            activated: true,
            report: { id: "q1", ref, title: "Q1", nesting: 0, type: "report", where: "view.report" },
        };

        expect(collectContextReferences(context, selected)).toEqual([]);
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

    it("should keep the visualization type of the widgets that carry one", () => {
        const context = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    widgets: [
                        {
                            widgetType: "insight",
                            widgetRef: idRef("insight1"),
                            title: "Insight 1",
                            visualizationUrl: "local:bar",
                        },
                        {
                            widgetType: "visualizationSwitcher",
                            visualizations: [
                                {
                                    widgetRef: idRef("insight2"),
                                    title: "Insight 2",
                                    visualizationUrl: "local:line",
                                },
                            ],
                        },
                    ],
                },
            },
        } as any;

        const result = collectAvailableReferences(context);

        expect(result[1]).toMatchObject({ id: "insight1", visualizationUrl: "local:bar" });
        expect(result[2]).toMatchObject({ id: "insight2", visualizationUrl: "local:line" });
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
