// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { buildContext, mergeContexts } from "./build.js";

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
        expect(result?.view?.dashboard?.title).toBe("Dash1");
        expect(result?.view?.dashboard?.widgets).toEqual([]);
        expect(result?.view?.dashboard?.filters).toEqual([]);
    });

    it("should return undefined if is empty object", () => {
        const c1 = { view: {} } as any;
        const c2 = { view: {} } as any;
        const result = mergeContexts(c1, c2);
        expect(result).toEqual(undefined);
    });

    it("should return undefined if references empty", () => {
        const c1 = { referencedObjects: [] } as any;
        const c2 = { referencedObjects: [] } as any;
        const result = mergeContexts(c1, c2);
        expect(result).toEqual(undefined);
    });

    it("should keep a document next to a dashboard", () => {
        const dashboard = { ref: idRef("dashboard-1", "analyticalDashboard"), widgets: [] };
        const publisherDocument = { ref: idRef("q1", "report"), title: "Q1" };

        expect(
            mergeContexts({ view: { dashboard } }, { view: { publisherDocument: publisherDocument } }),
        ).toEqual({
            view: { dashboard, publisherDocument: publisherDocument },
        });
    });

    it("should let the later context of a document that is not saved yet win", () => {
        expect(
            mergeContexts(
                { view: { publisherDocument: { title: "Draft" } } },
                { view: { publisherDocument: { title: "Draft 2" } } },
            ),
        ).toEqual({ view: { publisherDocument: { title: "Draft 2" } } });
    });

    it("should let the later context of the same document win", () => {
        const ref = idRef("q1", "report");

        expect(
            mergeContexts(
                { view: { publisherDocument: { ref, title: "Q1" } } },
                { view: { publisherDocument: { ref, title: "Q1 draft" } } },
            ),
        ).toEqual({ view: { publisherDocument: { ref, title: "Q1 draft" } } });
    });
});
