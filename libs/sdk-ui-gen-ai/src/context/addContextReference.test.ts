// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IGenAIContextObject, type StoreContext } from "../types.js";

import { addContextReference } from "./addContextReference.js";

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

    it("should add the open report that is not saved yet to the active context", () => {
        const context: StoreContext = { ambient: { view: { report: { title: "Draft" } } } };

        const result = addContextReference(context, {
            id: "unsaved",
            title: "Draft",
            nesting: 0,
            type: "report",
            where: "view.report",
        });

        expect(result.active?.view?.report).toEqual({ title: "Draft" });
    });

    it("should leave the context alone for a referenced object without a reference", () => {
        const result = addContextReference(ambientContext, {
            id: "orphan",
            title: "Orphan",
            nesting: 0,
            type: "visualization",
            where: "referencedObjects",
        });

        expect(result).toEqual(ambientContext);
    });

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

    it("should return empty context if ambient is missing", () => {
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
        expect(result).toEqual({
            active: {
                view: {
                    dashboard: undefined,
                },
            },
        });
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
        expect(result).toEqual({
            ...context,
            active: {
                view: {
                    dashboard: undefined,
                },
            },
        });
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
