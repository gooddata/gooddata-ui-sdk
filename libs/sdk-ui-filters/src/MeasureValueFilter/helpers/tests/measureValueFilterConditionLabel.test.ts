// (C) 2026 GoodData Corporation

import { type IntlShape, createIntl, createIntlCache } from "react-intl";
import { describe, expect, it } from "vitest";

import { type MeasureValueFilterCondition } from "@gooddata/sdk-model";

import { getMeasureValueFilterConditionLabel } from "../measureValueFilterConditionLabel.js";

const intlCache = createIntlCache();
const intl: IntlShape = createIntl(
    {
        locale: "en-US",
        messages: {
            "mvf.button.all": "All",
            "mvf.conditionsJoiner.or": "or",
            "mvf.button.range.values": "{from} and {to}",
            "mvf.button.greaterThan": "> {value}",
            "mvf.button.greaterThanOrEqualTo": "≥ {value}",
            "mvf.button.lessThan": "< {value}",
            "mvf.button.lessThanOrEqualTo": "≤ {value}",
            "mvf.button.equalTo": "= {value}",
            "mvf.button.notEqualTo": "≠ {value}",
            "mvf.operator.between.withValue": "between {from} and {to}",
            "mvf.operator.notBetween.withValue": "not between {from} and {to}",
        },
    },
    intlCache,
);

const comparison = (
    operator:
        | "GREATER_THAN"
        | "GREATER_THAN_OR_EQUAL_TO"
        | "LESS_THAN"
        | "LESS_THAN_OR_EQUAL_TO"
        | "EQUAL_TO"
        | "NOT_EQUAL_TO",
    value: number,
    treatNullValuesAs?: number,
): MeasureValueFilterCondition => ({
    comparison: { operator, value, ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }) },
});

const range = (
    operator: "BETWEEN" | "NOT_BETWEEN",
    from: number,
    to: number,
    treatNullValuesAs?: number,
): MeasureValueFilterCondition => ({
    range: { operator, from, to, ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }) },
});

describe("getMeasureValueFilterConditionLabel", () => {
    describe("empty / fallback", () => {
        it("returns 'All' when conditions is undefined", () => {
            expect(getMeasureValueFilterConditionLabel(intl, undefined)).toBe("All");
        });

        it("returns 'All' when conditions is empty array", () => {
            expect(getMeasureValueFilterConditionLabel(intl, [])).toBe("All");
        });

        it("returns 'All' when every condition is unrecognized", () => {
            // Forge a condition object that is neither comparison nor range — the helper
            // should skip it and fall back to the 'All' label rather than crash.
            const unknown = { something: "else" } as unknown as MeasureValueFilterCondition;
            expect(getMeasureValueFilterConditionLabel(intl, [unknown])).toBe("All");
        });
    });

    describe("single comparison", () => {
        it.each`
            operator                      | value  | expected
            ${"GREATER_THAN"}             | ${100} | ${"> 100"}
            ${"GREATER_THAN_OR_EQUAL_TO"} | ${50}  | ${"≥ 50"}
            ${"LESS_THAN"}                | ${10}  | ${"< 10"}
            ${"LESS_THAN_OR_EQUAL_TO"}    | ${5}   | ${"≤ 5"}
            ${"EQUAL_TO"}                 | ${42}  | ${"= 42"}
            ${"NOT_EQUAL_TO"}             | ${0}   | ${"≠ 0"}
        `("renders $operator as '$expected'", ({ operator, value, expected }) => {
            expect(getMeasureValueFilterConditionLabel(intl, [comparison(operator, value)])).toBe(expected);
        });
    });

    describe("single range", () => {
        it("renders BETWEEN as 'between {from} and {to}'", () => {
            expect(getMeasureValueFilterConditionLabel(intl, [range("BETWEEN", 10, 100)])).toBe(
                "between 10 and 100",
            );
        });

        it("renders NOT_BETWEEN as 'not between {from} and {to}'", () => {
            expect(getMeasureValueFilterConditionLabel(intl, [range("NOT_BETWEEN", 10, 100)])).toBe(
                "not between 10 and 100",
            );
        });
    });

    describe("percentage formatting", () => {
        it("multiplies comparison value by 100 and suffixes %", () => {
            // 0.5 → 50%, 0.05 → 5%
            expect(
                getMeasureValueFilterConditionLabel(intl, [comparison("GREATER_THAN", 0.5)], {
                    usePercentage: true,
                }),
            ).toBe("> 50%");
            expect(
                getMeasureValueFilterConditionLabel(intl, [comparison("LESS_THAN", 0.05)], {
                    usePercentage: true,
                }),
            ).toBe("< 5%");
        });

        it("multiplies range from/to by 100 and suffixes each with %", () => {
            expect(
                getMeasureValueFilterConditionLabel(intl, [range("BETWEEN", 0.1, 0.25)], {
                    usePercentage: true,
                }),
            ).toBe("between 10% and 25%");
        });

        it("rounds percentage values to 6 decimal places", () => {
            // 0.123456789 * 100 = 12.3456789 → rounded to 12.345679
            expect(
                getMeasureValueFilterConditionLabel(intl, [comparison("GREATER_THAN", 0.123456789)], {
                    usePercentage: true,
                }),
            ).toBe("> 12.345679%");
        });
    });

    describe("multi-condition (OR)", () => {
        it("joins different operators with ' or '", () => {
            const result = getMeasureValueFilterConditionLabel(intl, [
                comparison("GREATER_THAN", 100),
                comparison("LESS_THAN", 5),
            ]);
            expect(result).toBe("> 100 or < 5");
        });

        it("groups same-operator conditions: first full, rest value-only", () => {
            const result = getMeasureValueFilterConditionLabel(intl, [
                comparison("GREATER_THAN", 100),
                comparison("GREATER_THAN", 200),
            ]);
            expect(result).toBe("> 100 or 200");
        });

        it("preserves first-occurrence order across mixed groups", () => {
            // Order: > 100, < 5, > 200 → group "GREATER_THAN" first (full > 100, then 200),
            // then "LESS_THAN" group (full < 5).
            const result = getMeasureValueFilterConditionLabel(intl, [
                comparison("GREATER_THAN", 100),
                comparison("LESS_THAN", 5),
                comparison("GREATER_THAN", 200),
            ]);
            expect(result).toBe("> 100 or 200 or < 5");
        });

        it("groups same-operator range conditions with value-only repeats", () => {
            const result = getMeasureValueFilterConditionLabel(intl, [
                range("BETWEEN", 10, 20),
                range("BETWEEN", 30, 40),
            ]);
            expect(result).toBe("between 10 and 20 or 30 and 40");
        });

        it("skips unrecognized conditions in a multi-condition list", () => {
            const unknown = { foo: "bar" } as unknown as MeasureValueFilterCondition;
            const result = getMeasureValueFilterConditionLabel(intl, [
                unknown,
                comparison("GREATER_THAN", 100),
                unknown,
            ]);
            expect(result).toBe("> 100");
        });
    });

    describe("treatNullValuesAs", () => {
        it("renders the same label whether treatNullValuesAs is set or not", () => {
            // Documents current behavior: null-handling is a backend semantic, not surfaced
            // in the chip label. This test guards the contract; if behavior changes, both
            // expectations need to update together.
            const withoutNullHandling = getMeasureValueFilterConditionLabel(intl, [
                comparison("GREATER_THAN", 100),
            ]);
            const withNullHandling = getMeasureValueFilterConditionLabel(intl, [
                comparison("GREATER_THAN", 100, 0),
            ]);
            expect(withoutNullHandling).toBe(withNullHandling);
        });
    });

    describe("number formatting & separators", () => {
        it("forwards thousand/decimal separators to the number formatter", () => {
            // 1234567.5 with thousand="." and decimal="," → "1.234.567,5"
            const result = getMeasureValueFilterConditionLabel(
                intl,
                [comparison("GREATER_THAN", 1234567.5)],
                {
                    separators: { thousand: ".", decimal: "," },
                },
            );
            expect(result).toBe("> 1.234.567,5");
        });
    });
});
