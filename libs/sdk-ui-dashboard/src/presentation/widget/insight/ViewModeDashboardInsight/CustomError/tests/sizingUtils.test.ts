// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { shouldRenderFullContent } from "../sizingUtils.js";

describe("Report Visualization - resize utils", () => {
    describe("shouldRenderFullContent", () => {
        it.each`
            expected | name              | height | width
            ${true}  | ${"large enough"} | ${260} | ${420}
            ${false} | ${"too narrow"}   | ${420} | ${150}
            ${false} | ${"too short"}    | ${150} | ${420}
        `("should return $expected when $name", ({ expected, height, width }) => {
            expect(shouldRenderFullContent(height, width)).toBe(expected);
        });
    });
});
