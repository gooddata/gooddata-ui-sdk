// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    isAbsoluteDateFilter,
    isArithmeticMetricField,
    isAttributeField,
    isAttributeFilter,
    isAttributeSort,
    isCalculatedMetricField,
    isDateFilter,
    isInlineMetricField,
    isInsightWidget,
    isMetricField,
    isMetricSort,
    isMetricValueFilter,
    isNegativeAttributeFilter,
    isPoPMetricField,
    isPositiveAttributeFilter,
    isPreviousPeriodField,
    isRankingFilter,
    isRelativeDateFilter,
    isRichTextWidget,
    parseReferenceObject,
} from "../typeGuards.js";

describe("typeGuards", () => {
    describe("parseReferenceObject", () => {
        it("should parse valid references", () => {
            expect(parseReferenceObject("metric/revenue")).toEqual({
                type: "metric",
                identifier: "revenue",
            });
            expect(parseReferenceObject("label/name")).toEqual({
                type: "label",
                identifier: "name",
            });
            expect(parseReferenceObject("fact/amount")).toEqual({
                type: "fact",
                identifier: "amount",
            });
        });

        it("should return null for invalid references", () => {
            expect(parseReferenceObject("invalid")).toBeNull();
            expect(parseReferenceObject("")).toBeNull();
            expect(parseReferenceObject("unknown/id")).toBeNull();
        });
    });

    describe("field type guards", () => {
        it("isAttributeField", () => {
            expect(isAttributeField({ using: "label/name" })).toBe(true);
            expect(isAttributeField({ using: "attribute/region" })).toBe(true);
            expect(isAttributeField({ using: "metric/revenue" })).toBe(false);
            expect(isAttributeField({})).toBe(false);
        });

        it("isMetricField", () => {
            expect(isMetricField({ using: "metric/revenue" })).toBe(true);
            expect(isMetricField({ using: "label/name" })).toBe(false);
        });

        it("isInlineMetricField", () => {
            expect(isInlineMetricField({ maql: "SELECT SUM({fact/amount})" })).toBe(true);
            expect(isInlineMetricField({ using: "metric/m1" })).toBe(false);
        });

        it("isCalculatedMetricField", () => {
            expect(isCalculatedMetricField({ using: "fact/amount", aggregation: "SUM" })).toBe(true);
            expect(isCalculatedMetricField({ using: "fact/amount" })).toBe(false);
        });

        it("isArithmeticMetricField", () => {
            expect(isArithmeticMetricField({ using: ["m1", "m2"], operator: "SUM" })).toBe(true);
            expect(isArithmeticMetricField({ using: "m1", operator: "SUM" })).toBe(false);
        });

        it("isPoPMetricField", () => {
            expect(isPoPMetricField({ using: "m1", date_filter: "df1", type: "PREVIOUS_YEAR" })).toBe(true);
            expect(isPoPMetricField({ using: "m1", date_filter: "df1", type: "PREVIOUS_PERIOD" })).toBe(
                false,
            );
        });

        it("isPreviousPeriodField", () => {
            expect(isPreviousPeriodField({ using: "m1", date_filter: "df1", type: "PREVIOUS_PERIOD" })).toBe(
                true,
            );
            expect(isPreviousPeriodField({ using: "m1", date_filter: "df1", type: "PREVIOUS_YEAR" })).toBe(
                false,
            );
        });
    });

    describe("filter type guards", () => {
        it("isDateFilter", () => {
            expect(isDateFilter({ using: "date/created", type: "date_filter" })).toBe(true);
            expect(isDateFilter({ using: "label/name", type: "attribute_filter" })).toBe(false);
        });

        it("isAbsoluteDateFilter", () => {
            expect(
                isAbsoluteDateFilter({
                    using: "date/created",
                    type: "date_filter",
                    from: "2024-01-01",
                    to: "2024-12-31",
                }),
            ).toBe(true);
            expect(
                isAbsoluteDateFilter({
                    using: "date/created",
                    type: "date_filter",
                    from: -1,
                    to: 0,
                    granularity: "MONTH",
                }),
            ).toBe(false);
        });

        it("isRelativeDateFilter", () => {
            expect(
                isRelativeDateFilter({
                    using: "date/created",
                    type: "date_filter",
                    from: -12,
                    to: 0,
                    granularity: "MONTH",
                }),
            ).toBe(true);
            // all-time filter (no from/to) is also relative
            expect(isRelativeDateFilter({ using: "date/created", type: "date_filter" })).toBe(true);
        });

        it("isAttributeFilter / positive / negative", () => {
            const positive = {
                using: "label/region",
                type: "attribute_filter",
                state: { include: ["US", "EU"] },
            };
            const negative = { using: "label/region", type: "attribute_filter" };

            expect(isAttributeFilter(positive)).toBe(true);
            expect(isPositiveAttributeFilter(positive)).toBe(true);
            expect(isNegativeAttributeFilter(positive)).toBe(false);

            expect(isAttributeFilter(negative)).toBe(true);
            expect(isNegativeAttributeFilter(negative)).toBe(true);
            expect(isPositiveAttributeFilter(negative)).toBe(false);
        });

        it("isMetricValueFilter", () => {
            expect(
                isMetricValueFilter({
                    using: "metric/revenue",
                    type: "metric_value_filter",
                    condition: "GREATER_THAN",
                    value: 100,
                }),
            ).toBe(true);
            expect(isMetricValueFilter({ using: "label/name", type: "attribute_filter" })).toBe(false);
        });

        it("isRankingFilter", () => {
            expect(
                isRankingFilter({
                    using: "metric/revenue",
                    type: "ranking_filter",
                    operator: "TOP",
                    value: 10,
                }),
            ).toBe(true);
        });
    });

    describe("sort type guards", () => {
        it("isAttributeSort", () => {
            expect(isAttributeSort({ type: "attribute_sort", by: "label/name", direction: "ASC" })).toBe(
                true,
            );
            expect(isAttributeSort({ type: "metric_sort", metrics: [] })).toBe(false);
        });

        it("isMetricSort", () => {
            expect(isMetricSort({ type: "metric_sort", metrics: ["m1"] })).toBe(true);
            expect(isMetricSort({ type: "metric_sort", metrics: "m1" })).toBe(false);
        });
    });

    describe("widget type guards", () => {
        it("isInsightWidget", () => {
            expect(isInsightWidget({ visualization: "vis/chart1" })).toBe(true);
            expect(isInsightWidget({ content: "some text" })).toBe(false);
        });

        it("isRichTextWidget", () => {
            expect(isRichTextWidget({ content: "Hello **world**" })).toBe(true);
            expect(isRichTextWidget({ visualization: "vis/chart1" })).toBe(false);
        });
    });
});
