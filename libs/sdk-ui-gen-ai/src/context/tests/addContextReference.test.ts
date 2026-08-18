// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IGenAIContextObject, type StoreContext } from "../../types.js";
import { addAmbientContextReferences, addContextReference } from "../addContextReference.js";

describe("addContextReference", () => {
    const dashboardRef = idRef("dash1");
    const ambientContext: StoreContext = {
        ambient: {
            view: {
                dashboard: {
                    ref: dashboardRef,
                    title: "Dashboard 1",
                    widgets: [],
                    filters: [],
                },
            },
        },
    };

    it("should return same context if reference is undefined", () => {
        const result = addContextReference(ambientContext, undefined);
        expect(result).toBe(ambientContext);
    });

    it("should return same context if reference.where is not view.dashboard", () => {
        const reference: IGenAIContextObject = {
            id: "other",
            ref: idRef("other"),
            title: "Other",
            type: "insight" as any,
            where: "other" as any,
            nesting: 0,
        };
        const result = addContextReference(ambientContext, reference);
        expect(result).toBe(ambientContext);
    });

    it("should set ambientMode to enabled if reference matches ambient dashboard ref", () => {
        const reference: IGenAIContextObject = {
            id: "dash1",
            ref: dashboardRef,
            title: "Dashboard 1",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(ambientContext, reference);
        expect(result).toEqual({
            ...ambientContext,
            active: ambientContext.ambient,
        });
    });

    it("should return same context if reference does not match ambient dashboard ref", () => {
        const reference: IGenAIContextObject = {
            id: "dash2",
            ref: idRef("dash2"),
            title: "Dashboard 2",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(ambientContext, reference);
        expect(result).toBe(ambientContext);
    });

    it("should return same context if ambient is missing", () => {
        const context: StoreContext = {};
        const reference: IGenAIContextObject = {
            id: "dash1",
            ref: dashboardRef,
            title: "Dashboard 1",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(context, reference);
        expect(result).toBe(context);
    });

    it("should return same context if ambient.view.dashboard is missing", () => {
        const context: StoreContext = {
            ambient: {
                view: {},
            },
        };
        const reference: IGenAIContextObject = {
            id: "dash1",
            ref: dashboardRef,
            title: "Dashboard 1",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(context, reference);
        expect(result).toBe(context);
    });

    it("should add reference to referencedObjects", () => {
        const dashboard1Ref = idRef("dash1");
        const insightRef = idRef("insight1");
        const context: StoreContext = {
            active: {
                view: {
                    dashboard: {
                        ref: dashboard1Ref,
                        title: "Dashboard 1",
                        widgets: [],
                        filters: [],
                    },
                },
            },
        };
        const reference: IGenAIContextObject = {
            id: "insight1",
            ref: insightRef,
            title: "Insight 1",
            type: "widget",
            where: "referencedObjects",
            context: {
                ref: dashboard1Ref,
                title: "Dashboard 1",
                type: "DASHBOARD",
            },
            nesting: 1,
        };

        const result = addContextReference(context, reference);

        expect(result.active?.referencedObjects).toHaveLength(1);
        expect(result.active?.referencedObjects?.[0].context?.ref).toEqual(dashboard1Ref);
        expect(result.active?.referencedObjects?.[0].objects).toHaveLength(1);
        expect(result.active?.referencedObjects?.[0].objects[0]).toEqual({
            ref: insightRef,
            title: "Insight 1",
            type: "WIDGET",
        });
    });

    it("should append to existing group in referencedObjects", () => {
        const dashboard1Ref = idRef("dash1");
        const insight1Ref = idRef("insight1");
        const insight2Ref = idRef("insight2");
        const context: StoreContext = {
            active: {
                referencedObjects: [
                    {
                        context: {
                            ref: dashboard1Ref,
                            title: "Dashboard 1",
                            type: "DASHBOARD",
                        },
                        objects: [
                            {
                                ref: insight1Ref,
                                title: "Insight 1",
                                type: "WIDGET",
                            },
                        ],
                    },
                ],
            },
        };
        const reference: IGenAIContextObject = {
            id: "insight2",
            ref: insight2Ref,
            title: "Insight 2",
            type: "widget",
            where: "referencedObjects",
            context: {
                ref: dashboard1Ref,
                title: "Dashboard 1",
                type: "DASHBOARD",
            },
            nesting: 1,
        };

        const result = addContextReference(context, reference);

        expect(result.active?.referencedObjects).toHaveLength(1);
        expect(result.active?.referencedObjects?.[0].objects).toHaveLength(2);
        expect(result.active?.referencedObjects?.[0].objects[1]).toEqual({
            ref: insight2Ref,
            title: "Insight 2",
            type: "WIDGET",
        });
    });
});

describe("addAmbientContextReferences", () => {
    const dashboardContext = (id: string, filters: any[] = []) => ({
        view: { dashboard: { ref: idRef(id), title: id, widgets: [], filters } },
    });

    const pinnedFrom = (dashboardId: string, widgetId: string) => ({
        context: { ref: idRef(dashboardId), title: dashboardId, type: "DASHBOARD" as const },
        objects: [{ ref: idRef(widgetId), title: widgetId, type: "WIDGET" as const }],
    });

    it("should adopt the ambient context when there is none yet", () => {
        const result = addAmbientContextReferences({}, dashboardContext("dash1"));

        expect(result.ambient).toEqual(dashboardContext("dash1"));
        expect(result.active).toEqual(dashboardContext("dash1"));
    });

    it("should clear the active context when the user leaves all dashboards", () => {
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: dashboardContext("dash1"),
        };

        const result = addAmbientContextReferences(context, undefined);

        expect(result.ambient).toBeUndefined();
        expect(result.active).toBeUndefined();
    });

    it("should keep pinned objects when the same dashboard reports fresh state", () => {
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: {
                ...dashboardContext("dash1"),
                referencedObjects: [pinnedFrom("dash1", "widget1")],
            },
        };

        const result = addAmbientContextReferences(context, dashboardContext("dash1", [{ type: "x" }]));

        expect(result.active?.referencedObjects).toEqual([pinnedFrom("dash1", "widget1")]);
        expect(result.active?.view?.dashboard?.filters).toEqual([{ type: "x" }]);
    });

    it("should keep the objects pinned from the previous dashboard when switching dashboards", () => {
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: {
                ...dashboardContext("dash1"),
                referencedObjects: [pinnedFrom("dash1", "widget1")],
            },
        };

        const result = addAmbientContextReferences(context, dashboardContext("dash2"));

        expect(result.active).toEqual({
            ...dashboardContext("dash2"),
            referencedObjects: [pinnedFrom("dash1", "widget1")],
        });
    });

    it("should drop what the previous dashboard put in the context on its own", () => {
        const contributed = {
            objects: [{ ref: idRef("widget1"), title: "widget1", type: "WIDGET" as const }],
        };
        const context: StoreContext = {
            ambient: { ...dashboardContext("dash1"), referencedObjects: [contributed] },
            active: { ...dashboardContext("dash1"), referencedObjects: [contributed] },
        };

        const result = addAmbientContextReferences(context, dashboardContext("dash2"));

        expect(result.active).toEqual(dashboardContext("dash2"));
    });

    const added = (objects: { ref: any; title: string; type: "DASHBOARD" | "WIDGET" }[]) => ({ objects });

    it("should keep an added dashboard when switching dashboards", () => {
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: {
                ...dashboardContext("dash1"),
                referencedObjects: [added([{ ref: idRef("dash3"), title: "dash3", type: "DASHBOARD" }])],
            },
        };

        const result = addAmbientContextReferences(context, dashboardContext("dash2"));

        expect(result.active?.referencedObjects).toEqual([
            added([{ ref: idRef("dash3"), title: "dash3", type: "DASHBOARD" }]),
        ]);
    });

    it("should keep an added visualization when switching dashboards", () => {
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: {
                ...dashboardContext("dash1"),
                referencedObjects: [added([{ ref: idRef("insight1"), title: "insight1", type: "WIDGET" }])],
            },
        };

        const result = addAmbientContextReferences(context, dashboardContext("dash2"));

        expect(result.active?.referencedObjects).toEqual([
            added([{ ref: idRef("insight1"), title: "insight1", type: "WIDGET" }]),
        ]);
    });

    it("should not keep an added dashboard once the user navigates to it", () => {
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: {
                ...dashboardContext("dash1"),
                referencedObjects: [added([{ ref: idRef("dash2"), title: "dash2", type: "DASHBOARD" }])],
            },
        };

        const result = addAmbientContextReferences(context, dashboardContext("dash2"));

        expect(result.active).toEqual(dashboardContext("dash2"));
    });

    it("should not keep an added visualization the newly opened dashboard renders itself", () => {
        const dash2WithInsight1 = {
            view: {
                dashboard: {
                    ref: idRef("dash2"),
                    title: "dash2",
                    filters: [],
                    widgets: [
                        {
                            widgetType: "insight" as const,
                            widgetRef: idRef("widget1"),
                            insightRef: idRef("insight1"),
                            title: "widget1",
                        },
                    ],
                },
            },
        };
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: {
                ...dashboardContext("dash1"),
                referencedObjects: [
                    added([
                        { ref: idRef("insight1"), title: "insight1", type: "WIDGET" },
                        { ref: idRef("insight2"), title: "insight2", type: "WIDGET" },
                    ]),
                ],
            },
        };

        const result = addAmbientContextReferences(context, dash2WithInsight1);

        expect(result.active?.referencedObjects).toEqual([
            added([{ ref: idRef("insight2"), title: "insight2", type: "WIDGET" }]),
        ]);
    });

    it("should not keep a pinned widget once the user navigates back to its dashboard", () => {
        const dash2WithWidget1 = {
            view: {
                dashboard: {
                    ref: idRef("dash2"),
                    title: "dash2",
                    filters: [],
                    widgets: [
                        {
                            widgetType: "insight" as const,
                            widgetRef: idRef("widget1"),
                            insightRef: idRef("insight1"),
                            title: "widget1",
                        },
                    ],
                },
            },
        };
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: {
                ...dashboardContext("dash1"),
                referencedObjects: [pinnedFrom("dash2", "widget1")],
            },
        };

        const result = addAmbientContextReferences(context, dash2WithWidget1);

        expect(result.active).toEqual(dash2WithWidget1);
    });

    it("should keep an added metric when switching dashboards", () => {
        const metric = { objects: [{ ref: idRef("metric1"), title: "metric1", type: "METRIC" as const }] };
        const context: StoreContext = {
            ambient: dashboardContext("dash1"),
            active: { ...dashboardContext("dash1"), referencedObjects: [metric] },
        };

        const result = addAmbientContextReferences(context, dashboardContext("dash2"));

        expect(result.active?.referencedObjects).toEqual([metric]);
    });
});
