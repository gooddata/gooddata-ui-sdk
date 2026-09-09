// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { detectExportMode } from "./loadPlatformContext.js";

function stubHash(hash: string): void {
    vi.stubGlobal("window", { location: { hash } });
}

describe("detectExportMode", () => {
    it.each([
        "#/dashboard/id?mode=export",
        "#/dashboard/id?displayMode=export",
        "#/dashboard/id?mode=export&widgetId=x",
        "#/dashboard/id?widgetId=x&mode=export",
        "#/dashboard/id?mode=export&slideWidth=1800&slideHeight=750",
        "#/dashboard/id?displayMode=export&exportId=abc-123",
        "#/dashboard/id?MODE=EXPORT",
    ])("accepts %s", (hash) => {
        stubHash(hash);

        expect(detectExportMode()).toBe(true);
    });

    it.each([
        "#/dashboard/id?mode=exported",
        "#/dashboard/id",
        "#/dashboard/id?drillUrl=https://ext.example/p?mode=export",
        "#/dashboard/id?redirect=/a/b?displayMode=export",
    ])("rejects %s", (hash) => {
        stubHash(hash);

        expect(detectExportMode()).toBe(false);
    });

    it("reports no export outside a browser", () => {
        vi.stubGlobal("window", undefined);

        expect(detectExportMode()).toBe(false);
    });
});
