// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { removeContextReference } from "../removeContextReference.js";

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
