// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { detectExportMode } from "./loadPlatformContext.js";

function stubHash(hash: string): void {
    vi.stubGlobal("window", { location: { hash } });
}

function stubLocation(search: string, hash: string): void {
    vi.stubGlobal("window", { location: { search, hash } });
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

    // An app on a browser router (no hash) carries the query in the search string instead. Reports
    // names the mode the backend exporter opens export_slideshow.
    it.each([
        "?mode=export",
        "?mode=export&slideWidth=1800&slideHeight=750",
        "?MODE=EXPORT",
        "?mode=export_slideshow&exportId=abc&pageWidth=1200",
        "?pageWidth=1200&mode=export_slideshow",
        "?mode=EXPORT_SLIDESHOW",
    ])("accepts %s in the search string", (search) => {
        stubLocation(search, "");

        expect(detectExportMode()).toBe(true);
    });

    // The client-side export views are opened by people, not by the exporter, and keep the chrome.
    it.each(["?mode=export_pdf", "?mode=export_pptx", "?mode=exported", "?mode=export_", "?widgetId=x", ""])(
        "rejects %s in the search string",
        (search) => {
            stubLocation(search, "");

            expect(detectExportMode()).toBe(false);
        },
    );

    it("accepts the reports slideshow mode in the hash as well", () => {
        stubLocation("", "#/report/x?mode=export_slideshow");

        expect(detectExportMode()).toBe(true);
    });

    it("reports no export outside a browser", () => {
        vi.stubGlobal("window", undefined);

        expect(detectExportMode()).toBe(false);
    });
});
