// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isSupportedWidgetProperties } from "./useHandlePropertiesPushData.js";

describe("isSupportedWidgetProperties", () => {
    it("should support a persisted total rename/reset override for the new pivot table", () => {
        const properties = { controls: { totals: { attribute: [{ type: "sum" as const }] } } };

        expect(isSupportedWidgetProperties(properties, true, true)).toBe(true);
    });

    it("should not support a totals override for the legacy pivot table", () => {
        const properties = { controls: { totals: { attribute: [{ type: "sum" as const }] } } };

        expect(isSupportedWidgetProperties(properties, true, false)).toBe(false);
    });

    it("should still support column widths and text wrapping", () => {
        expect(isSupportedWidgetProperties({ controls: { columnWidths: [] } }, false, true)).toBe(true);
        expect(isSupportedWidgetProperties({ controls: { textWrapping: {} } }, false, true)).toBe(true);
    });

    it("should reject properties carrying none of the supported controls", () => {
        expect(isSupportedWidgetProperties({ controls: {} }, true, true)).toBe(false);
        expect(isSupportedWidgetProperties(undefined, true, true)).toBe(false);
    });
});
