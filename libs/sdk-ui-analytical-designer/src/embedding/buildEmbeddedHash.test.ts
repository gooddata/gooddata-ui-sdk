// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { buildEmbeddedHash } from "./buildEmbeddedHash.js";

describe("buildEmbeddedHash", () => {
    it("should build the new-insight route with hidden and displayed actions", () => {
        expect(
            buildEmbeddedHash({
                hideActions: ["open", "export", "saveAs"],
                displayActions: ["cancel"],
                isEmbeddedFromKD: true,
            }),
        ).toBe(
            "#/reportId/edit?hideAction=[open,export,saveAs]&displayAction=[cancel]&isEmbeddedFromKD=true",
        );
    });

    it("should build the edit-from-dashboard route", () => {
        expect(
            buildEmbeddedHash({
                insightId: "insight-1",
                sourceDashboardId: "dash-1",
                hideActions: ["open", "clear", "export"],
                allowDashboardLinks: false,
                isEmbeddedFromKD: true,
            }),
        ).toBe(
            "#/insight-1/edit?sourceDashboard=dash-1&hideAction=[open,clear,export]&allowDashboardLinks=false&isEmbeddedFromKD=true",
        );
    });

    it("should keep the source dashboard param for a dashboard that has no identifier yet", () => {
        expect(
            buildEmbeddedHash({
                insightId: "insight-1",
                sourceDashboardId: "",
                hideActions: ["open", "clear", "export"],
                isEmbeddedFromKD: true,
            }),
        ).toBe("#/insight-1/edit?sourceDashboard=&hideAction=[open,clear,export]&isEmbeddedFromKD=true");
    });

    it("should build the explore route with separators and tags", () => {
        expect(
            buildEmbeddedHash({
                sourceInsightId: "insight-2",
                hideActions: ["saveAs"],
                thousandSeparator: " ",
                decimalSeparator: ",",
                includeObjectsWithTags: ["a", "b"],
            }),
        ).toBe(
            "#/reportId/edit?sourceInsight=insight-2&hideAction=[saveAs]&thousandSeparator= &decimalSeparator=,&includeObjectsWithTags=[a,b]",
        );
    });

    it("should build a bare route with no params", () => {
        expect(buildEmbeddedHash({})).toBe("#/reportId/edit");
    });
});
