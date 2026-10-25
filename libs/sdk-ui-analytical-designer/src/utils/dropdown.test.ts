// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import {
    DROPDOWN_MAX_HEIGHT,
    DROPDOWN_MIN_HEIGHT,
    DROPDOWN_OFFSET_FROM_NODE,
    DROP_DOWN_BUTTON_HEIGHT,
    type IDropdownWindow,
    MAX_DATE_DATASET_DROPDOWN_WIDTH,
    PADDING,
    getDateDatasetDropdownWidth,
    getDialogHeight,
} from "./dropdown.js";

const LOW_WINDOW_HEIGHT = 360; // TWICE DROPDOWN_MIN_HEIGHT
const HIGH_WINDOW_HEIGHT = 1024;

describe("getDialogHeight", () => {
    let windowObj: IDropdownWindow;

    describe("when viewport height is low", () => {
        beforeEach(() => {
            windowObj = {
                innerHeight: LOW_WINDOW_HEIGHT,
                pageYOffset: 0,
            };
        });

        it("and button is near the vertical center, should equal minimum dialog height", () => {
            expect(getDialogHeight(LOW_WINDOW_HEIGHT / 2, windowObj)).toEqual(DROPDOWN_MIN_HEIGHT);
        });

        it("and button is near the top, should calc height to fit dropdown in bottom area", () => {
            const height = getDialogHeight(0, windowObj);

            expect(height).toBeGreaterThan(DROPDOWN_MIN_HEIGHT);
            expect(height).toBeLessThan(DROPDOWN_MAX_HEIGHT);
        });

        it("and button is near the bottom, should use height of top area", () => {
            const height = getDialogHeight(LOW_WINDOW_HEIGHT - 20, windowObj);

            expect(height).toBeGreaterThan(DROPDOWN_MIN_HEIGHT);
            expect(height).toBeLessThan(DROPDOWN_MAX_HEIGHT);
        });
    });

    describe("when viewport height is high", () => {
        it("should equal maximum dialog height", () => {
            windowObj = {
                innerHeight: HIGH_WINDOW_HEIGHT,
                pageYOffset: 0,
            };

            expect(getDialogHeight(0, windowObj)).toEqual(DROPDOWN_MAX_HEIGHT);
        });

        it("should stretch as much as possible", () => {
            windowObj = {
                innerHeight: HIGH_WINDOW_HEIGHT,
                pageYOffset: 0,
            };

            expect(getDialogHeight(0, windowObj, true)).toEqual(
                HIGH_WINDOW_HEIGHT - DROPDOWN_OFFSET_FROM_NODE - DROP_DOWN_BUTTON_HEIGHT - PADDING,
            );
        });
    });
});

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

    it("clamps to the available space when the trigger sits flush against the viewport edge", () => {
        const narrowWindow = { innerWidth: 300 };

        expect(getDateDatasetDropdownWidth(80, 900, 290, 300, narrowWindow)).toEqual(300 - PADDING);
    });

    it("does not overflow when the trigger is centered in a narrow viewport", () => {
        const narrowWindow = { innerWidth: 300 };

        expect(getDateDatasetDropdownWidth(80, 900, 120, 180, narrowWindow)).toEqual(180 - PADDING);
    });

    it("never shrinks below the trigger width even when neither side has room", () => {
        const veryNarrowWindow = { innerWidth: 50 };

        expect(getDateDatasetDropdownWidth(120, 900, 0, 50, veryNarrowWindow)).toEqual(120);
    });

    it("never shrinks below the trigger width, when the trigger's right edge sits outside the viewport after a resize", () => {
        const narrowWindow = { innerWidth: 150 };

        // Trigger spans x=100-180: its right edge is already past the 150px viewport, e.g.
        // because the window shrank after mount but before this recalculates. The raw
        // (unclamped) distance from the right edge to x=0 would report 170px of "room" to
        // open leftward, but a body anchored at that off-screen edge would still overflow —
        // this must fall back to the left-anchored capacity (40px) or the trigger width.
        expect(getDateDatasetDropdownWidth(80, 900, 100, 180, narrowWindow)).toEqual(80);
    });

    it("never shrinks below the trigger width, when the trigger's left edge sits outside the viewport after a resize", () => {
        const narrowWindow = { innerWidth: 150 };

        expect(getDateDatasetDropdownWidth(80, 900, -50, 30, narrowWindow)).toEqual(80);
    });
});
