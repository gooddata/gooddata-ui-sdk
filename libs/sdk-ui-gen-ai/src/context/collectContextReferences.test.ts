// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IGenAIUserContext, type IGenAIWidgetDescriptor, idRef, uriRef } from "@gooddata/sdk-model";

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

    it("should collect a document other than the ambient one", () => {
        const context: IGenAIUserContext = {
            view: { publisherDocument: { ref: idRef("q2", "report"), title: "Q2" } },
        };
        const selected: SelectedContext = {
            activated: true,
            publisherDocument: {
                id: "q1",
                ref: idRef("q1", "report"),
                title: "Q1",
                nesting: 0,
                type: "publisherDocument",
                where: "view.publisherDocument",
            },
        };

        expect(collectContextReferences(context, selected)).toEqual([
            {
                id: "q2",
                ref: idRef("q2", "report"),
                type: "publisherDocument",
                where: "view.publisherDocument",
                title: "Q2",
                nesting: 0,
            },
        ]);
    });

    it("should collect a v2 document as the viewed document", () => {
        const context: IGenAIUserContext = {
            view: { publisherDocumentV2: { ref: idRef("d1"), title: "D1" } },
        };

        expect(collectContextReferences(context, undefined)).toEqual([
            {
                id: "d1",
                ref: idRef("d1"),
                type: "publisherDocument",
                where: "view.publisherDocument",
                title: "D1",
                nesting: 0,
            },
        ]);
    });

    it("should collect a document that is not saved yet", () => {
        const context: IGenAIUserContext = { view: { publisherDocument: { title: "Draft" } } };

        expect(collectContextReferences(context, undefined)).toEqual([
            {
                id: "unsaved",
                type: "publisherDocument",
                where: "view.publisherDocument",
                title: "Draft",
                nesting: 0,
            },
        ]);
    });

    it("should skip the ambient document when it is not saved yet", () => {
        const context: IGenAIUserContext = { view: { publisherDocument: { title: "Draft" } } };
        const selected: SelectedContext = {
            activated: true,
            publisherDocument: {
                id: "unsaved",
                title: "Draft",
                nesting: 0,
                type: "publisherDocument",
                where: "view.publisherDocument",
            },
        };

        expect(collectContextReferences(context, selected)).toEqual([]);
    });

    it("should skip the ambient document", () => {
        const ref = idRef("q1", "report");
        const context: IGenAIUserContext = { view: { publisherDocument: { ref, title: "Q1" } } };
        const selected: SelectedContext = {
            activated: true,
            publisherDocument: {
                id: "q1",
                ref,
                title: "Q1",
                nesting: 0,
                type: "publisherDocument",
                where: "view.publisherDocument",
            },
        };

        expect(collectContextReferences(context, selected)).toEqual([]);
    });
});

describe("collectAvailableReferences", () => {
    it("should return empty array if context is undefined", () => {
        expect(collectAvailableReferences(undefined)).toEqual([]);
    });

    it("preserves mixed widget order and the first reference's metadata without mutating input", () => {
        const context: IGenAIUserContext = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dashboard",
                    widgets: [
                        { widgetType: "insight", widgetRef: idRef("dash1"), title: "Dashboard collision" },
                        {
                            widgetType: "insight",
                            widgetRef: idRef("shared"),
                            title: "First insight",
                            insightRef: idRef("insight1"),
                            visualizationUrl: "local:bar",
                        },
                        {
                            widgetType: "visualizationSwitcher",
                            widgetRef: idRef("switcher"),
                            title: "Switcher itself is not collected",
                            visualizations: [
                                {
                                    widgetType: "insight",
                                    widgetRef: idRef("shared"),
                                    title: "Duplicate insight",
                                    insightRef: idRef("different-insight"),
                                    visualizationUrl: "local:pie",
                                },
                                {
                                    widgetType: "insight",
                                    widgetRef: uriRef("/widgets/2"),
                                    title: "First switcher entry",
                                    insightRef: uriRef("/insights/2"),
                                    visualizationUrl: "local:line",
                                },
                                {
                                    widgetType: "insight",
                                    widgetRef: uriRef("/widgets/2"),
                                    title: "Duplicate within switcher",
                                },
                                {
                                    widgetType: "insight",
                                    widgetRef: idRef("dash1"),
                                    title: "Dashboard collision in switcher",
                                },
                            ],
                        },
                        {
                            widgetType: "insight",
                            widgetRef: uriRef("/widgets/2"),
                            title: "Duplicate after switcher",
                        },
                        { widgetType: "richText", widgetRef: idRef("text"), title: "Ignored" },
                        { widgetType: "insight", widgetRef: idRef("last"), title: "Last" },
                    ],
                },
            },
        };
        const before = structuredClone(context);
        const dashboardContext = { ref: idRef("dash1"), title: "Dashboard", type: "DASHBOARD" };

        expect(collectAvailableReferences(context)).toStrictEqual([
            {
                id: "dash1",
                ref: idRef("dash1"),
                type: "dashboard",
                where: "view.dashboard",
                title: "Dashboard",
                nesting: 0,
            },
            {
                id: "shared",
                ref: idRef("shared"),
                type: "widget",
                where: "referencedObjects",
                title: "First insight",
                nesting: 1,
                context: dashboardContext,
                insightRef: idRef("insight1"),
                visualizationUrl: "local:bar",
            },
            {
                id: "/widgets/2",
                ref: uriRef("/widgets/2"),
                type: "widget",
                where: "referencedObjects",
                title: "First switcher entry",
                nesting: 1,
                context: dashboardContext,
                insightRef: uriRef("/insights/2"),
                visualizationUrl: "local:line",
            },
            {
                id: "last",
                ref: idRef("last"),
                type: "widget",
                where: "referencedObjects",
                title: "Last",
                nesting: 1,
                context: dashboardContext,
                insightRef: undefined,
            },
        ]);
        expect(context).toStrictEqual(before);
    });

    it("deduplicates by serialized reference rather than the displayed identifier", () => {
        const refs = [idRef("same"), idRef("same", "insight"), uriRef("same")];
        const context: IGenAIUserContext = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    widgets: refs.flatMap((widgetRef) => [
                        { widgetType: "insight", widgetRef, title: "First" },
                        { widgetType: "insight", widgetRef: { ...widgetRef }, title: "Duplicate" },
                    ]),
                },
            },
        };

        const widgets = collectAvailableReferences(context).slice(1);

        expect(widgets.map(({ ref }) => ref)).toStrictEqual(refs);
        expect(widgets.map(({ title }) => title)).toEqual(["First", "First", "First"]);
    });

    describe.each(["insight", "visualizationSwitcher"] as const)("%s widgets", (widgetType) => {
        function createContext(widget: IGenAIWidgetDescriptor): IGenAIUserContext {
            return {
                view: {
                    dashboard: {
                        ref: uriRef("/dashboards/1"),
                        widgets: [
                            widgetType === "insight"
                                ? widget
                                : {
                                      widgetType,
                                      widgetRef: idRef("switcher"),
                                      title: "Switcher",
                                      visualizations: [widget],
                                  },
                        ],
                    },
                },
            };
        }

        it.each([
            { title: "Widget", placeholder: "Placeholder", expected: "Widget" },
            { title: "", placeholder: "Placeholder", expected: "Placeholder" },
            { title: "", placeholder: "", expected: "/widgets/1" },
            { title: "", placeholder: undefined, expected: "/widgets/1" },
        ])("preserves title fallbacks for $title and $placeholder", ({ title, placeholder, expected }) => {
            const context = createContext({
                widgetType: "insight",
                widgetRef: uriRef("/widgets/1"),
                title,
                visualizationUrl: "",
            });

            const result = collectAvailableReferences(context, placeholder);

            expect(result[0].title).toBe(placeholder || "/dashboards/1");
            expect(result[1]).toStrictEqual({
                id: "/widgets/1",
                ref: uriRef("/widgets/1"),
                type: "widget",
                where: "referencedObjects",
                nesting: 1,
                title: expected,
                insightRef: undefined,
                context: {
                    ref: uriRef("/dashboards/1"),
                    type: "DASHBOARD",
                    title: placeholder || "/dashboards/1",
                },
            });
        });

        it("skips missing widget references", () => {
            const context = createContext({
                widgetType: "insight",
                title: "Missing ref",
            } as IGenAIWidgetDescriptor);

            expect(collectAvailableReferences(context)).toHaveLength(1);
        });
    });

    it("ignores missing switcher entries and contexts without a dashboard", () => {
        expect(collectAvailableReferences({})).toEqual([]);
        expect(collectAvailableReferences({ view: { publisherDocument: { title: "Document" } } })).toEqual(
            [],
        );

        const context: IGenAIUserContext = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    widgets: [
                        {
                            widgetType: "visualizationSwitcher",
                            widgetRef: idRef("switcher"),
                            title: "Switcher",
                        },
                    ],
                },
            },
        };

        expect(collectAvailableReferences(context)).toHaveLength(1);
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
