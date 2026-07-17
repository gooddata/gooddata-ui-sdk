// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { collectContextReferences } from "../collectContextReferences.js";

describe("collectContextReferences", () => {
    it("should return empty array if context is undefined", () => {
        expect(collectContextReferences(undefined, "user")).toEqual([]);
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
        const result = collectContextReferences(context, "user");
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
        const result = collectContextReferences(context, "user");
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
        const result = collectContextReferences(context, "ambient");
        expect(result).toHaveLength(1);
        expect(result[0].ref).toEqual(idRef("dash1"));
    });
});
