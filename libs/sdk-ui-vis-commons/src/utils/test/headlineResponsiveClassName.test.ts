// (C) 2021 GoodData Corporation
import { getHeadlineResponsiveClassName } from "../headlineResponsiveClassName.js";
import { describe, it, expect } from "vitest";

describe("getHeadlineResponsiveClassName", () => {
    it.each([
        ["gd-small", 150, false],
        ["gd-shortened-label", 150, true],
        ["gd-medium", 200, true],
        ["gd-large", 200, false],
    ])("should return className is %s", (expected: string, width: number, isShortened: boolean) => {
        expect(getHeadlineResponsiveClassName(width, isShortened)).toEqual(expected);
    });
});
