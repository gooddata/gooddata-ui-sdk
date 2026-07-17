// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { buildContext, mergeContexts } from "../build.js";

describe("buildContext", () => {
    it("should return context with provided props", () => {
        const props = {
            view: {
                dashboard: {
                    ref: { identifier: "dash" },
                    title: "Dash",
                    widgets: [],
                    filters: [],
                },
            },
        };
        const result = buildContext(props);
        expect(result).toEqual(props);
    });
});

describe("mergeContexts", () => {
    it("should merge multiple contexts", () => {
        const c1 = { view: { dashboard: { title: "Dash" } } } as any;
        const c2 = { referencedObjects: [{ type: "WIDGET", ref: { identifier: "w1" } }] } as any;
        const result = mergeContexts(c1, c2);
        expect(result).toEqual({
            view: { dashboard: { title: "Dash" } },
            referencedObjects: [{ type: "WIDGET", ref: { identifier: "w1" } }],
        });
    });

    it("should merge contexts", () => {
        const c1 = { view: { dashboard: { title: "Dash", widgets: [] } } } as any;
        const c2 = { view: { dashboard: { title: "Dash1", filters: [] } } } as any;
        const result = mergeContexts(c1, c2);
        expect(result.view?.dashboard?.title).toBe("Dash1");
        expect(result.view?.dashboard?.widgets).toEqual(undefined);
        expect(result.view?.dashboard?.filters).toEqual([]);
    });
});
