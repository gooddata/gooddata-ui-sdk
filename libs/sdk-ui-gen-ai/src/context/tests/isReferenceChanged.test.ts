// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { isReferenceChanged } from "../isReferenceChanged.js";

describe("isReferenceChanged", () => {
    it("should return false if both contexts are undefined", () => {
        expect(isReferenceChanged(undefined, undefined)).toBe(false);
    });

    it("should return false if dashboard refs are the same", () => {
        const context1 = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                    widgets: [],
                    filters: [],
                },
            },
        } as any;
        const context2 = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1 Updated",
                    widgets: [],
                    filters: [],
                },
            },
        } as any;
        expect(isReferenceChanged(context1, context2)).toBe(false);
    });

    it("should return true if dashboard refs are different", () => {
        const context1 = {
            view: {
                dashboard: {
                    ref: idRef("dash1"),
                    title: "Dash 1",
                    widgets: [],
                    filters: [],
                },
            },
        } as any;
        const context2 = {
            view: {
                dashboard: {
                    ref: idRef("dash2"),
                    title: "Dash 2",
                    widgets: [],
                    filters: [],
                },
            },
        } as any;
        expect(isReferenceChanged(context1, context2)).toBe(true);
    });

    it("should return true if one context is undefined and other has dashboard", () => {
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
        expect(isReferenceChanged(undefined, context)).toBe(true);
        expect(isReferenceChanged(context, undefined)).toBe(true);
    });
});
