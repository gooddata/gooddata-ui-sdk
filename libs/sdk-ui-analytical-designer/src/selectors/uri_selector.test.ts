// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { analyticalDashboardUriFactorySelector } from "./uri_selector.js";

describe("uri_selector", () => {
    describe("analyticalDashboardUriFactorySelector", () => {
        it("should return host route uri", () => {
            const result = analyticalDashboardUriFactorySelector.resultFunc("mockProject");
            expect(result("abc")).toEqual("/workspace/mockProject/dashboards/#/dashboard/abc");
        });
    });
});
