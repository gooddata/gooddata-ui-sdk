// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isDashboardParameter } from "../parameter.js";
import { dashboardParameterFull, dashboardParameterMinimal } from "./parameter.fixtures.js";

describe("dashboard parameter type guards", () => {
    describe("isDashboardParameter", () => {
        const Scenarios: Array<[boolean, string, unknown]> = [
            ...InvalidInputTestCases,
            [true, "minimal dashboard parameter", dashboardParameterMinimal],
            [true, "full dashboard parameter", dashboardParameterFull],
            [false, "object missing parameterType", { ref: dashboardParameterMinimal.ref, mode: "active" }],
            [
                false,
                "object with non-identifier ref",
                { ...dashboardParameterMinimal, ref: { uri: "/parameter" } },
            ],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardParameter(input)).toBe(expectedResult);
        });
    });
});
