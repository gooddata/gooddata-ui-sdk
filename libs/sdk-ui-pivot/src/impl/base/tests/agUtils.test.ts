// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { getGridIndex } from "../agUtils.js";

describe("getGridIndex", () => {
    const gridDistance = 20;

    it.each([
        ["100", 100, 5],
        ["110", 110, 5],
        ["99", 99, 4],
    ])(
        "should return correct row index when scrolltop is %s",
        (_: string, scrollTop: number, expectedRowIndex: number) => {
            expect(getGridIndex(scrollTop, gridDistance)).toEqual(expectedRowIndex);
        },
    );
});
