// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import type { StoreContext } from "../types.js";

import { removeContextReference } from "./removeContextReference.js";

describe("removeContextReference", () => {
    it("should return empty active context if context is empty", () => {
        const context: StoreContext = {};
        expect(removeContextReference(context, { where: "view.dashboard" } as any).active).toBeUndefined();
    });

    it("should return context as is if reference is undefined", () => {
        const context: StoreContext = {
            active: { view: { dashboard: { ref: idRef("dash1"), widgets: [] } } },
        };
        expect(removeContextReference(context, undefined)).toEqual(context);
    });

    it("should remove dashboard reference", () => {
        const context: StoreContext = {
            active: {
                view: {
                    dashboard: {
                        ref: idRef("dash1"),
                        title: "Dash 1",
                        widgets: [],
                    },
                },
            },
        };
        const reference = {
            id: "dash1",
            title: "Dash 1",
            where: "view.dashboard" as const,
            ref: idRef("dash1"),
            type: "widget" as const,
            nesting: 1,
        };
        const result = removeContextReference(context, reference);
        expect(result.active).toBeUndefined();
    });

    it("should remove dashboard but keep other view properties if they existed", () => {
        const context: StoreContext = {
            active: {
                view: {
                    dashboard: { ref: idRef("dash1") },
                    somethingElse: {},
                },
            } as any,
        };
        const reference = { where: "view.dashboard", ref: idRef("dash1") } as any;
        const result = removeContextReference(context, reference);
        expect(result.active).toEqual({ view: { somethingElse: {} } });
    });

    it("should clean up referencedObjects if empty", () => {
        const context: StoreContext = {
            active: {
                view: { dashboard: { ref: idRef("dash1") } },
                referencedObjects: [],
            } as any,
        };
        const reference = { where: "view.dashboard", ref: idRef("dash1") } as any;
        const result = removeContextReference(context, reference);
        expect(result.active).toBeUndefined();
    });

    it("should not mutate the original context", () => {
        const context: StoreContext = {
            active: {
                view: {
                    dashboard: { ref: idRef("dash1") },
                    other: "value",
                },
            } as any,
        };
        const reference = { where: "view.dashboard", ref: idRef("dash1") } as any;
        removeContextReference(context, reference);

        expect(context.active?.view?.dashboard).toBeDefined();
    });
});
