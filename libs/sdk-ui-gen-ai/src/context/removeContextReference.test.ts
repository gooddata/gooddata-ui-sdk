// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { removeAmbientContribution, removeContextReference } from "./removeContextReference.js";

describe("removeContextReference", () => {
    it("should return undefined if context is undefined", () => {
        expect(removeContextReference(undefined, { where: "view.dashboard" } as any)).toBeUndefined();
    });

    it("should return context as is if reference is undefined", () => {
        const context = { view: { dashboard: { ref: idRef("dash1") } } } as any;
        expect(removeContextReference(context, undefined)).toEqual(context);
    });

    it("should remove dashboard reference", () => {
        const context = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                },
            },
        } as any;
        const reference = {
            where: "view.dashboard",
            ref: idRef("dash1"),
        } as any;
        const result = removeContextReference(context, reference);
        expect(result).toBeUndefined();
    });

    it("should remove dashboard but keep other view properties if they existed", () => {
        const context = {
            view: {
                dashboard: { ref: idRef("dash1") },
                somethingElse: {},
            },
        } as any;
        const reference = { where: "view.dashboard", ref: idRef("dash1") } as any;
        const result = removeContextReference(context, reference);
        expect(result).toEqual({ view: { somethingElse: {} } });
    });

    it("should clean up referencedObjects if empty", () => {
        const context = {
            view: { dashboard: { ref: idRef("dash1") } },
            referencedObjects: [],
        } as any;
        const reference = { where: "view.dashboard", ref: idRef("dash1") } as any;
        const result = removeContextReference(context, reference);
        expect(result).toBeUndefined();
    });

    it("should not mutate the original context", () => {
        const context = {
            view: {
                dashboard: { ref: idRef("dash1") },
                other: "value",
            },
        } as any;
        const reference = { where: "view.dashboard", ref: idRef("dash1") } as any;
        removeContextReference(context, reference);

        expect(context.view.dashboard).toBeDefined();
    });
});

describe("removeAmbientContribution", () => {
    const ambient = { view: { dashboard: { ref: idRef("dash1"), title: "Dash 1", widgets: [] } } } as any;

    const pinnedFrom = (dashboardId: string, widgetId: string) => ({
        context: { ref: idRef(dashboardId), title: dashboardId, type: "DASHBOARD" },
        objects: [{ ref: idRef(widgetId), title: widgetId, type: "WIDGET" }],
    });

    it("should return undefined if context is undefined", () => {
        expect(removeAmbientContribution(undefined, ambient)).toBeUndefined();
    });

    it("should return context as is if there is no ambient dashboard to subtract", () => {
        const context = { view: { dashboard: { ref: idRef("dash1") } } } as any;

        expect(removeAmbientContribution(context, undefined)).toEqual(context);
        expect(removeAmbientContribution(context, {} as any)).toEqual(context);
    });

    it("should remove the dashboard contributed by the ambient context", () => {
        const context = { view: { dashboard: { ref: idRef("dash1"), title: "Dash 1" } } } as any;

        expect(removeAmbientContribution(context, ambient)).toBeUndefined();
    });

    it("should keep a dashboard seeded independently of the ambient one", () => {
        const context = { view: { dashboard: { ref: idRef("dash2"), title: "Dash 2" } } } as any;

        expect(removeAmbientContribution(context, ambient)).toEqual(context);
    });

    it("should keep the objects the user pinned from the ambient dashboard", () => {
        const context = {
            view: { dashboard: { ref: idRef("dash1") } },
            referencedObjects: [pinnedFrom("dash1", "widget1")],
        } as any;

        expect(removeAmbientContribution(context, ambient)).toEqual({
            referencedObjects: [pinnedFrom("dash1", "widget1")],
        });
    });

    it("should remove the references the ambient context carried itself", () => {
        const contributed = pinnedFrom("dash1", "widget1");
        const ambientWithObjects = { ...ambient, referencedObjects: [contributed] } as any;
        const context = {
            view: { dashboard: { ref: idRef("dash1") } },
            referencedObjects: [contributed, pinnedFrom("dash2", "widget2")],
        } as any;

        expect(removeAmbientContribution(context, ambientWithObjects)).toEqual({
            referencedObjects: [pinnedFrom("dash2", "widget2")],
        });
    });

    it("should keep objects pinned from a different dashboard", () => {
        const context = {
            view: { dashboard: { ref: idRef("dash1") } },
            referencedObjects: [pinnedFrom("dash2", "widget2")],
        } as any;

        expect(removeAmbientContribution(context, ambient)).toEqual({
            referencedObjects: [pinnedFrom("dash2", "widget2")],
        });
    });

    it("should not mutate the original context", () => {
        const context = {
            view: { dashboard: { ref: idRef("dash1") } },
            referencedObjects: [pinnedFrom("dash1", "widget1")],
        } as any;

        removeAmbientContribution(context, ambient);

        expect(context.view.dashboard).toBeDefined();
        expect(context.referencedObjects).toHaveLength(1);
    });
});
