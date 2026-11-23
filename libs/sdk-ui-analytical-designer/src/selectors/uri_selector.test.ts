// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { analyticalDashboardUriFactorySelector, documentUriFactorySelector } from "./uri_selector.js";

describe("uri_selector", () => {
    describe("analyticalDashboardUriFactorySelector", () => {
        it("should return host route uri", () => {
            const result = analyticalDashboardUriFactorySelector.resultFunc("mockProject");
            expect(result("abc")).toEqual("/workspace/mockProject/dashboards/#/dashboard/abc");
        });
    });

    describe("documentUriFactorySelector", () => {
        it("returns the Reports route of a document", () => {
            const result = documentUriFactorySelector.resultFunc("mockProject");
            expect(result({ id: "a/b", type: "document" })).toEqual(
                "/workspace/mockProject/reports/document/a%2Fb",
            );
        });

        it.each(["documentTemplate", "pageTemplate"] as const)("returns no route for a %s", (type) => {
            const result = documentUriFactorySelector.resultFunc("mockProject");
            expect(result({ id: "a", type })).toBeUndefined();
        });
    });
});
