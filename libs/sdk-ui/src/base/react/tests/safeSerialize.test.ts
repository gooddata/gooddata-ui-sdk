// (C) 2019-2021 GoodData Corporation

import { safeSerialize } from "../safeSerialize.js";
import { describe, expect, it } from "vitest";

describe("safeSerialize", () => {
    type Scenario = [string, any];

    const validScenarios: Scenario[] = [
        ["null", null],
        ["undefined", undefined],
        ["number", 42],
        ["string", "hello"],
        ["array", [1, 2, 3]],
        ["object", { a: 42 }],
    ];

    it.each(validScenarios)("should serialize %s", (_, input) => {
        expect(safeSerialize(input)).toMatchSnapshot();
    });

    it("should handle circular objects", () => {
        const circularReference: any = { otherData: 123 };
        circularReference.myself = circularReference;

        expect(safeSerialize(circularReference)).toEqual("");
    });
});
