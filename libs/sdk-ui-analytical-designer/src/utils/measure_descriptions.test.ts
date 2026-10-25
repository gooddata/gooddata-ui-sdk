// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { itemCache, measureBucketItems } from "../tests/constants.test.helpers.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import { type IRawBucket } from "../typings/buckets.js";

import { getMeasuresDescriptions } from "./measure_descriptions.js";
import { mockIntlProp } from "./with_intl.js";

describe("Measure descriptions generator", () => {
    describe("getMeasuresDescriptions", () => {
        it("should generate measure titles for all types of measures", () => {
            const bucket1 = {
                localIdentifier: "measures",
                items: measureBucketItems.slice(0, 5),
            };
            const bucket2 = {
                localIdentifier: "another_measures",
                items: measureBucketItems.slice(4),
            };
            const buckets = [bucket1, bucket2];
            const intlMock = mockIntlProp();

            const descriptions = getMeasuresDescriptions(buckets, itemCache, intlMock);

            expect(descriptions).toMatchObject({
                // simple measure
                m1: {
                    alias: null,
                    title: "Awareness",
                },
                // fact-based measure with aggregation and show in percent
                m2: {
                    alias: null,
                    title: "% Sum of Cart Additions",
                },
                // derived measure - same period year ago
                m3_pop: {
                    alias: null,
                    title: "Awareness - SP year ago",
                },
                // derived measure - previous period
                m3_previous_period: {
                    alias: null,
                    title: "Awareness - period ago",
                },
                // attribute based measure
                m4: {
                    alias: null,
                    title: "Count of Product",
                },
                // arithmetic measure with no operand set
                m9: {
                    alias: null,
                    title: "Difference of …",
                },
                // arithmetic measure with single operand set
                m10: {
                    alias: null,
                    title: "Ratio of % Sum of Cart Additions …",
                },
                // simple arithmetic measure with both operands set
                m8: {
                    alias: null,
                    title: "Change from % Sum of Cart Additions to Awareness",
                },
                // arithmetic measure consisting of other arithmetic measures, shortened to 50 characters
                m7: {
                    alias: null,
                    title:
                        "Difference of Awareness and Ratio of Awareness and Sum of Awareness " +
                        "and % Sum of Cart Additions",
                },
            });
        });

        it("should limit simple measure name to 1000 characters", () => {
            const measure = { ...measureBucketItems[0], attribute: "aaeFKXFYiCc0_long" };
            const bucket = {
                items: [measure],
            };
            const buckets = [bucket];
            const intlMock = mockIntlProp();

            const descriptions = getMeasuresDescriptions(buckets, itemCache, intlMock);

            expect(descriptions["m1"].title.length).toBe(1000);
        });

        it("should use aliases", () => {
            const bucket = {
                items: measureBucketItems.map((measure) => ({
                    ...measure,
                    alias: `measure_${measure.localIdentifier}_alias`,
                })),
            };
            const buckets = [bucket];
            const intlMock = mockIntlProp();

            const descriptions = getMeasuresDescriptions(buckets, itemCache, intlMock);

            expect(descriptions).toMatchObject({
                // simple measure with alias
                m1: {
                    alias: "measure_m1_alias",
                    title: "Awareness",
                },
                // fact-based measure with aggregation and show in percent
                m2: {
                    alias: "measure_m2_alias",
                    title: "% Sum of Cart Additions",
                },
                // derived measure - same period year ago
                m3_pop: {
                    alias: "measure_m3_pop_alias",
                    title: "measure_m3_alias - SP year ago",
                },
                // derived measure - previous period
                m3_previous_period: {
                    alias: "measure_m3_previous_period_alias",
                    title: "measure_m3_alias - period ago",
                },
                // attribute based measure
                m4: {
                    alias: "measure_m4_alias",
                    title: "Count of Product",
                },
                // arithmetic measure with no operand set
                m9: {
                    alias: "measure_m9_alias",
                    title: "Difference of …",
                },
                // arithmetic measure with single operand set
                m10: {
                    alias: "measure_m10_alias",
                    title: "Ratio of measure_m2_alias …",
                },
                // simple arithmetic measure with both operands set
                m8: {
                    alias: "measure_m8_alias",
                    title: "Change from measure_m2_alias to measure_m1_alias",
                },
                // arithmetic measure consisting of other arithmetic measures, shortened to 50 characters
                m7: {
                    alias: "measure_m7_alias",
                    title: "Difference of measure_m1_alias and measure_m6_alias",
                },
            });
        });

        const bucketWithArithmeticMeasures: IRawBucket = {
            localIdentifier: "measures",
            items: [
                {
                    attribute: "aaeFKXFYiCc0",
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "m1",
                    type: "metric",
                },
                {
                    attribute: "aaeFKXFYiCc0",
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "m1_format",
                    type: "metric",
                    format: "##.#00%",
                },
                {
                    attribute: "aaeFKXFYiCc0",
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: true,
                    showOnSecondaryAxis: false,
                    localIdentifier: "m1_shown_percent",
                    type: "metric",
                },
                {
                    attribute: "aaeFKXFYiCc0",
                    aggregation: null,
                    alias: null,
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    type: "metric",
                    localIdentifier: "m1_pop",
                    filters: [],
                    masterLocalIdentifier: "m1",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
                {
                    attribute: "aaeFKXFYiCc0_percent",
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "m2",
                    type: "metric",
                },
                {
                    attribute: "aaeFKXFYiCc0_percent",
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "m2_format",
                    type: "metric",
                    format: "#.## custom1",
                },
                {
                    attribute: "aaeFKXFYiCc0_percent",
                    aggregation: null,
                    alias: null,
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    type: "metric",
                    localIdentifier: "m2_pop",
                    filters: [],
                    masterLocalIdentifier: "m2",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
                {
                    attribute: "aaeFKXFYiCc0_percent",
                    aggregation: null,
                    alias: null,
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    type: "metric",
                    localIdentifier: "m2_format_pop",
                    filters: [],
                    masterLocalIdentifier: "m2_format",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "am_ratio",
                    type: "metric",
                    operandLocalIdentifiers: ["m1", "m2"],
                    operator: ArithmeticOperatorType.RATIO,
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "am_ratio_format",
                    type: "metric",
                    operandLocalIdentifiers: ["m1", "m2"],
                    operator: ArithmeticOperatorType.RATIO,
                    format: "custom%",
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "am_format_with_percentage_sign",
                    type: "metric",
                    operandLocalIdentifiers: ["m1", "m2"],
                    operator: ArithmeticOperatorType.DIFFERENCE,
                    format: "custom\\%",
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    type: "metric",
                    localIdentifier: "am_ratio_pop",
                    filters: [],
                    masterLocalIdentifier: "am_ratio",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "am_change",
                    type: "metric",
                    operandLocalIdentifiers: ["m1", "m2"],
                    operator: ArithmeticOperatorType.CHANGE,
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    filters: [],
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    localIdentifier: "am_change_format",
                    type: "metric",
                    operandLocalIdentifiers: ["m1", "m2"],
                    operator: ArithmeticOperatorType.CHANGE,
                    format: "#.## custom2",
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    type: "metric",
                    localIdentifier: "am_change_pop",
                    filters: [],
                    masterLocalIdentifier: "am_change",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
                {
                    attribute: null,
                    aggregation: null,
                    alias: null,
                    showInPercent: false,
                    showOnSecondaryAxis: false,
                    type: "metric",
                    localIdentifier: "am_change_format_pop",
                    filters: [],
                    masterLocalIdentifier: "am_change_format",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
            ],
        };

        it("should return isFormattedAsPercentage and showInPercent for all types of measures", () => {
            const buckets = [bucketWithArithmeticMeasures];
            const intlMock = mockIntlProp();

            const descriptions = getMeasuresDescriptions(buckets, itemCache, intlMock);

            expect(descriptions).toMatchObject({
                m1: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                m1_format: {
                    isFormattedAsPercentage: true,
                    showInPercent: false,
                },
                m1_shown_percent: {
                    isFormattedAsPercentage: false,
                    showInPercent: true,
                },
                m1_pop: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                m2: {
                    isFormattedAsPercentage: true,
                    showInPercent: false,
                },
                m2_format: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                m2_pop: {
                    isFormattedAsPercentage: true,
                    showInPercent: false,
                },
                m2_format_pop: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                am_ratio: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                am_ratio_format: {
                    isFormattedAsPercentage: true,
                    showInPercent: false,
                },
                am_format_with_percentage_sign: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                am_ratio_pop: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                am_change: {
                    isFormattedAsPercentage: true,
                    showInPercent: false,
                },
                am_change_format: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
                am_change_pop: {
                    isFormattedAsPercentage: true,
                    showInPercent: false,
                },
                am_change_format_pop: {
                    isFormattedAsPercentage: false,
                    showInPercent: false,
                },
            });
        });
    });
});
