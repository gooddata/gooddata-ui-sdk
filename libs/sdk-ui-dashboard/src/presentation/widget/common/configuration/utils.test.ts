// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { MAX_DATE_DATASET_DROPDOWN_WIDTH, PADDING, getDateDatasetDropdownWidth } from "./utils.js";

describe("getDateDatasetDropdownWidth", () => {
    const WIDE_WINDOW = { innerWidth: 1440 };

    it("never returns less than the trigger width, even when content is narrower", () => {
        expect(getDateDatasetDropdownWidth(120, 60, 100, 220, WIDE_WINDOW)).toEqual(120);
    });

    it("grows to fit content wider than the trigger", () => {
        expect(getDateDatasetDropdownWidth(120, 220, 100, 220, WIDE_WINDOW)).toEqual(220);
    });

    it("caps growth at MAX_DATE_DATASET_DROPDOWN_WIDTH", () => {
        expect(getDateDatasetDropdownWidth(120, 900, 100, 220, WIDE_WINDOW)).toEqual(
            MAX_DATE_DATASET_DROPDOWN_WIDTH,
        );
    });

    it("opens leftward to grow past the trigger width when the trigger sits near the right viewport edge", () => {
        const narrowWindow = { innerWidth: 300 };

        expect(getDateDatasetDropdownWidth(80, 900, 210, 290, narrowWindow)).toEqual(290 - PADDING);
    });

    it("opens rightward to grow past the trigger width when the trigger sits near the left viewport edge", () => {
        const narrowWindow = { innerWidth: 300 };

        expect(getDateDatasetDropdownWidth(80, 900, 0, 80, narrowWindow)).toEqual(
            narrowWindow.innerWidth - 0 - PADDING,
        );
    });

    it("picks whichever side has more room when both sides are constrained", () => {
        const narrowWindow = { innerWidth: 220 };

        expect(getDateDatasetDropdownWidth(60, 900, 100, 160, narrowWindow)).toEqual(160 - PADDING);
    });

    it("never shrinks below the trigger width, even when neither side has more than a sliver of room", () => {
        const tinyWindow = { innerWidth: 20 };

        expect(getDateDatasetDropdownWidth(10, 900, 5, 15, tinyWindow)).toEqual(10);
    });

    it("never shrinks below the trigger width, when the trigger's right edge sits outside the viewport after a resize", () => {
        const narrowWindow = { innerWidth: 150 };

        expect(getDateDatasetDropdownWidth(80, 900, 100, 180, narrowWindow)).toEqual(80);
    });

    it("never shrinks below the trigger width, when the trigger's left edge sits outside the viewport after a resize", () => {
        const narrowWindow = { innerWidth: 150 };

        expect(getDateDatasetDropdownWidth(80, 900, -50, 30, narrowWindow)).toEqual(80);
    });
});
