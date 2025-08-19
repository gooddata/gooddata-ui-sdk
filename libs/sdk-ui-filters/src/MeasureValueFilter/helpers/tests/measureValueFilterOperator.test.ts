// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { getOperatorIcon, getOperatorTranslationKey } from "../measureValueFilterOperator.js";

describe("getOperatorTranslationKey", () => {
    it.each`
        operator                      | result
        ${"ALL"}                      | ${"mvf.operator.all"}
        ${"GREATER_THAN"}             | ${"mvf.operator.greaterThan"}
        ${"GREATER_THAN_OR_EQUAL_TO"} | ${"mvf.operator.greaterThanOrEqualTo"}
        ${"LESS_THAN"}                | ${"mvf.operator.lessThan"}
        ${"LESS_THAN_OR_EQUAL_TO"}    | ${"mvf.operator.lessThanOrEqualTo"}
        ${"EQUAL_TO"}                 | ${"mvf.operator.equalTo"}
        ${"NOT_EQUAL_TO"}             | ${"mvf.operator.notEqualTo"}
        ${"BETWEEN"}                  | ${"mvf.operator.between"}
        ${"NOT_BETWEEN"}              | ${"mvf.operator.notBetween"}
    `("should return $result translation key for $operator operator", ({ operator, result }) => {
        expect(getOperatorTranslationKey(operator)).toBe(result);
    });
});

describe("getOperatorIcon", () => {
    it.each`
        operator                      | result
        ${"ALL"}                      | ${"all"}
        ${"GREATER_THAN"}             | ${"greater-than"}
        ${"GREATER_THAN_OR_EQUAL_TO"} | ${"greater-than-equal-to"}
        ${"LESS_THAN"}                | ${"less-than"}
        ${"LESS_THAN_OR_EQUAL_TO"}    | ${"less-than-equal-to"}
        ${"EQUAL_TO"}                 | ${"equal-to"}
        ${"NOT_EQUAL_TO"}             | ${"not-equal-to"}
        ${"BETWEEN"}                  | ${"between"}
        ${"NOT_BETWEEN"}              | ${"not-between"}
    `("should return $result for $operator operator", ({ operator, result }) => {
        expect(getOperatorIcon(operator)).toBe(result);
    });
});
