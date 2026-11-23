// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type DateAttributeGranularity,
    DateGranularity,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    idRef,
    localIdRef,
    newAbsoluteDateFilter,
    newAbsoluteGranularityDateFilter,
    newAllTimeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
    newRelativeDateFilter,
    uriRef,
} from "@gooddata/sdk-model";

import {
    type IFilterWithApplyOnResult,
    convertFilter,
    newFilterWithApplyOnResult,
} from "./FilterConverter.js";
import { absoluteFilter, relativeFilter } from "./InvalidInputs.test.helpers.js";

describe("tiger filter converter from model to AFM", () => {
    describe("convert measure value filter", () => {
        const Scenarios: Array<[string, IMeasureValueFilter]> = [
            [
                "specified using id of metric",
                newMeasureValueFilter(idRef("measureId", "measure"), "GREATER_THAN", 10),
            ],
            [
                "specified using id of fact",
                newMeasureValueFilter(idRef("factId", "fact"), "GREATER_THAN", 10),
            ],
            [
                "specified using localId of metric specified as string",
                newMeasureValueFilter("localId", "GREATER_THAN", 10),
            ],
            [
                "specified using localId of metric specified by value",
                newMeasureValueFilter(ReferenceMd.Amount, "GREATER_THAN", 10),
            ],
        ];

        it.each(Scenarios)("should convert %s", (_desc, filter) => {
            expect(convertFilter(filter)).toMatchSnapshot();
        });

        it("should throw exception if filter has idRef without type", () => {
            expect(() => {
                convertFilter(newMeasureValueFilter(idRef("ambiguous"), "GREATER_THAN", 10));
            }).toThrowErrorMatchingSnapshot();
        });

        it("should throw exception if filter is using uriRef", () => {
            expect(() => {
                convertFilter(newMeasureValueFilter(uriRef("unsupported"), "GREATER_THAN", 10));
            }).toThrow();
        });

        it("should preserve localIdentifier for a single-condition comparison filter", () => {
            const filter: IMeasureValueFilter = {
                measureValueFilter: {
                    measure: localIdRef("m1"),
                    localIdentifier: "mvfLocalId",
                    conditions: [{ comparison: { operator: "GREATER_THAN", value: 10 } }],
                },
            };
            const result = convertFilter(filter) as {
                comparisonMeasureValueFilter: { localIdentifier?: string };
            };
            expect(result.comparisonMeasureValueFilter.localIdentifier).toBe("mvfLocalId");
        });

        it("should preserve localIdentifier for a single-condition range filter (CQ-2464)", () => {
            // Regression: the range branch used to drop localIdentifier, which broke matching of
            // BETWEEN / NOT BETWEEN measure value filters when comparing saved vs current alert filters.
            const filter: IMeasureValueFilter = {
                measureValueFilter: {
                    measure: localIdRef("m1"),
                    localIdentifier: "mvfLocalId",
                    conditions: [{ range: { operator: "BETWEEN", from: 64, to: 128 } }],
                },
            };
            const result = convertFilter(filter) as {
                rangeMeasureValueFilter: { localIdentifier?: string };
            };
            expect(result.rangeMeasureValueFilter.localIdentifier).toBe("mvfLocalId");
        });
    });
    describe("convert absolute date filter", () => {
        const Scenarios: Array<[string, unknown]> = [
            ["absolute date filter without 'to' attribute", absoluteFilter.withoutTo],
            ["absolute date filter without 'from' attribute", absoluteFilter.withoutFrom],
            [
                "absolute date filter from model to AFM with all attributes",
                newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2019-08-06", "2019-08-12"),
            ],
            [
                "absolute date filter with empty values handling (include)",
                {
                    absoluteDateFilter: {
                        ...newAbsoluteDateFilter(
                            ReferenceMd.DateDatasets.Closed.ref,
                            "2019-08-06",
                            "2019-08-12",
                        ).absoluteDateFilter,
                        emptyValueHandling: "include",
                    },
                },
            ],
            [
                "absolute date filter with empty values handling (exclude)",
                {
                    absoluteDateFilter: {
                        ...newAbsoluteDateFilter(
                            ReferenceMd.DateDatasets.Closed.ref,
                            "2019-08-06",
                            "2019-08-12",
                        ).absoluteDateFilter,
                        emptyValueHandling: "exclude",
                    },
                },
            ],
            [
                "absolute date filter with empty values handling (only)",
                {
                    absoluteDateFilter: {
                        ...newAbsoluteDateFilter(
                            ReferenceMd.DateDatasets.Closed.ref,
                            "2019-08-06",
                            "2019-08-12",
                        ).absoluteDateFilter,
                        emptyValueHandling: "only",
                    },
                },
            ],
        ];

        it.each(Scenarios)("should convert %s", (_desc, input) => {
            expect(convertFilter(input as IFilter | IFilterWithApplyOnResult)).toMatchSnapshot();
        });

        it.each([
            ["GDC.time.week_us", "2026-07-19", "2026-07-25"],
            ["GDC.time.month", "2026-03-01", "2026-04-30"],
            ["GDC.time.quarter", "2026-01-01", "2026-06-30"],
            ["GDC.time.year", "2025-01-01", "2026-12-31"],
            ["GDC.time.date", "2019-08-06", "2019-08-12"],
            ["GDC.time.hour", "2026-03-01 08:00", "2026-03-01 18:00"],
            ["GDC.time.fiscal_month", "2026-03-01", "2026-04-30"],
            ["GDC.time.week", "2026-07-20", "2026-07-26"],
        ] as [DateAttributeGranularity, string, string][])(
            "should send a range at the %s granularity as its days",
            (granularity, from, to) => {
                const filter = newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, from, to, {
                    granularity,
                    emptyValueHandling: "include",
                });

                expect(convertFilter(filter)).toEqual({
                    absoluteDateFilter: {
                        dataset: { identifier: { id: "dt_closedate_timestamp", type: "dataset" } },
                        from,
                        to,
                        localIdentifier: undefined,
                        emptyValueHandling: "INCLUDE",
                    },
                });
            },
        );
    });

    describe("convert absolute granularity date filter", () => {
        const dataSet = ReferenceMd.DateDatasets.Closed.ref;
        const dataset = { identifier: { id: "dt_closedate_timestamp", type: "dataset" } };

        it("should convert a range with both edges", () => {
            const filter = newAbsoluteGranularityDateFilter(dataSet, "GDC.time.month", "2026-01", "2026-03", {
                localIdentifier: "dateFilter",
            });

            expect(convertFilter(filter)).toEqual({
                absoluteGranularityDateFilter: {
                    dataset,
                    granularity: "MONTH",
                    from: "2026-01",
                    to: "2026-03",
                    localIdentifier: "dateFilter",
                },
            });
        });

        it.each([
            [
                "'from'",
                newAbsoluteGranularityDateFilter(dataSet, "GDC.time.quarter", "2026-2"),
                { from: "2026-2" },
            ],
            [
                "'to'",
                newAbsoluteGranularityDateFilter(dataSet, "GDC.time.quarter", undefined, "2026-1"),
                { to: "2026-1" },
            ],
        ])("should convert a range with only %s", (_desc, filter, range) => {
            expect(convertFilter(filter)).toEqual({
                absoluteGranularityDateFilter: {
                    dataset,
                    granularity: "QUARTER",
                    ...range,
                    localIdentifier: undefined,
                },
            });
        });

        it("should convert empty values handling", () => {
            const filter = newAbsoluteGranularityDateFilter(dataSet, "GDC.time.week", "2026-05", "2026-08", {
                emptyValueHandling: "only",
            });

            expect(convertFilter(filter)).toEqual({
                absoluteGranularityDateFilter: expect.objectContaining({
                    granularity: "WEEK",
                    emptyValueHandling: "ONLY",
                }),
            });
        });

        it("should convert apply on result", () => {
            const filter = newAbsoluteGranularityDateFilter(dataSet, "GDC.time.year", "2025", "2026");

            expect(convertFilter(newFilterWithApplyOnResult(filter, true))).toEqual({
                absoluteGranularityDateFilter: expect.objectContaining({ applyOnResult: true }),
            });
        });
    });
    describe("convert relative date filter", () => {
        const Scenarios: Array<[string, unknown]> = [
            [
                "year granularity",
                newRelativeDateFilter(ReferenceMd.DateDatasets.Closed.ref, DateGranularity["year"], 2, 7),
            ],
            [
                "month granularity",
                newRelativeDateFilter(ReferenceMd.DateDatasets.Closed.ref, DateGranularity["month"], -3, 9),
            ],
            [
                "quarter granularity",
                newRelativeDateFilter(
                    ReferenceMd.DateDatasets.Closed.ref,
                    DateGranularity["quarter"],
                    25,
                    -2,
                ),
            ],
            [
                "date granularity",
                newRelativeDateFilter(ReferenceMd.DateDatasets.Closed.ref, DateGranularity["date"], -11, 0),
            ],
            [
                "week granularity",
                newRelativeDateFilter(ReferenceMd.DateDatasets.Closed.ref, DateGranularity["week"], 50, 100),
            ],
            [
                "relative date filter with empty values handling (include)",
                {
                    relativeDateFilter: {
                        ...newRelativeDateFilter(
                            ReferenceMd.DateDatasets.Closed.ref,
                            DateGranularity["date"],
                            -11,
                            0,
                        ).relativeDateFilter,
                        emptyValueHandling: "include",
                    },
                },
            ],
            [
                "all time date filter (default handling)",
                newAllTimeFilter(ReferenceMd.DateDatasets.Closed.ref),
            ],
            [
                "all time date filter with empty values handling (include)",
                newAllTimeFilter(ReferenceMd.DateDatasets.Closed.ref, undefined, "include"),
            ],
            [
                "all time date filter with empty values handling (exclude)",
                newAllTimeFilter(ReferenceMd.DateDatasets.Closed.ref, undefined, "exclude"),
            ],
            ["missing 'to' parameter", relativeFilter.withoutTo],
            ["missing 'from' parameter", relativeFilter.withoutFrom],
        ];
        it.each(Scenarios)("should return AFM relative date filter with %s", (_desc, input) => {
            expect(convertFilter(input as IFilter | IFilterWithApplyOnResult)).toMatchSnapshot();
        });

        it("should convert all time date filter with empty values handling (only)", () => {
            const result = convertFilter(
                newAllTimeFilter(ReferenceMd.DateDatasets.Closed.ref, undefined, "only"),
            );

            expect(result).toMatchObject({
                allTimeDateFilter: {
                    emptyValueHandling: "ONLY",
                },
            });
        });

        it("should not convert all time date filter with unsupported empty values handling", () => {
            const unsupportedFilter = newAllTimeFilter(
                ReferenceMd.DateDatasets.Closed.ref,
            ) as IFilterWithApplyOnResult["filter"] & {
                relativeDateFilter: { emptyValueHandling?: string };
            };
            unsupportedFilter.relativeDateFilter.emptyValueHandling = "unsupported";

            expect(convertFilter(unsupportedFilter)).toBeNull();
        });
    });
    describe("convert filter", () => {
        const positiveAttributeFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, ["value"]);
        const negativeAttributeFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, ["value 2"]);
        const positiveAttributeFilterWithUris = newPositiveAttributeFilter(ReferenceMd.Product.Name, {
            uris: ["value"],
        });
        const negativeAttributeFilterWithUris = newNegativeAttributeFilter(ReferenceMd.Product.Name, {
            uris: ["value"],
        });

        it("should preserve the computed attribute type in attribute filters", () => {
            const ref = idRef("rep_performance", "computedAttribute");

            expect(convertFilter(newPositiveAttributeFilter(ref, ["high"]))).toEqual({
                positiveAttributeFilter: {
                    label: { identifier: { id: "rep_performance", type: "computedAttribute" } },
                    in: { values: ["high"] },
                },
            });
            expect(convertFilter(newNegativeAttributeFilter(ref, ["low"]))).toEqual({
                negativeAttributeFilter: {
                    label: { identifier: { id: "rep_performance", type: "computedAttribute" } },
                    notIn: { values: ["low"] },
                },
            });
        });

        const Scenarios: Array<[string, unknown]> = [
            ["positive attribute filter", positiveAttributeFilter],
            ["positive attribute filter with uri attribute elements", positiveAttributeFilterWithUris],
            [
                "positive attribute filter with applyOnResult true",
                newFilterWithApplyOnResult(positiveAttributeFilter, true),
            ],
            ["negative attribute filter", negativeAttributeFilter],
            ["negative attribute filter with uri attribute elements", negativeAttributeFilterWithUris],
            [
                "negative attribute filter with applyOnResult false",
                newFilterWithApplyOnResult(negativeAttributeFilter, false),
            ],
            [
                "arbitrary attribute filter",
                newArbitraryAttributeFilter(
                    ReferenceMd.Product.Name,
                    ["custom-a", "custom-b"],
                    false,
                    "f_arb",
                ),
            ],
            [
                "match attribute filter",
                newMatchAttributeFilter(
                    ReferenceMd.Product.Name,
                    "contains",
                    "foo",
                    { caseSensitive: true, negativeSelection: true },
                    "f_match",
                ),
            ],
            [
                "absolute date filter",
                newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2019-08-06", "2019-08-12"),
            ],
            [
                "relative date filter",
                newRelativeDateFilter(ReferenceMd.DateDatasets.Closed.ref, DateGranularity["date"], 20, 30),
            ],
            ["comparison measure value filter", newMeasureValueFilter(ReferenceMd.Won, "GREATER_THAN", 128)],
            [
                "comparison measure value filter with treatNullValueAs",
                newMeasureValueFilter(ReferenceMd.Won, "GREATER_THAN", 128, 0),
            ],
            ["range measure value filter", newMeasureValueFilter(ReferenceMd.Won, "BETWEEN", 64, 128)],
            [
                "range measure value filter with treatNullValueAs",
                newMeasureValueFilter(ReferenceMd.Won, "BETWEEN", 64, 128, 0),
            ],
            [
                "range measure value filter with crossed boundaries",
                newMeasureValueFilter(ReferenceMd.Won, "BETWEEN", 128, 64),
            ],
            ["ranking filter", newRankingFilter(ReferenceMd.Won, "BOTTOM", 3)],
            [
                "ranking filter with attributes",
                newRankingFilter(ReferenceMd.Won, [ReferenceMd.IsActive.attribute.displayForm], "TOP", 3),
            ],
            [
                "ranking filter with strictLimitOfRows",
                {
                    rankingFilter: {
                        ...newRankingFilter(ReferenceMd.Won, "TOP", 3).rankingFilter,
                        strictLimitOfRows: true,
                    },
                } satisfies IRankingFilter,
            ],
            [
                "comparison measure value filter with dimensionality",
                newMeasureValueFilterWithOptions(ReferenceMd.Won, {
                    operator: "GREATER_THAN",
                    value: 50,
                    dimensionality: [ReferenceMd.IsActive.attribute.displayForm],
                }),
            ],
            [
                "range measure value filter with dimensionality",
                newMeasureValueFilterWithOptions(ReferenceMd.Won, {
                    operator: "BETWEEN",
                    from: 10,
                    to: 100,
                    dimensionality: [
                        ReferenceMd.IsActive.attribute.displayForm,
                        idRef("anotherAttr", "displayForm"),
                    ],
                }),
            ],
            [
                "compound measure value filter with localIdentifier",
                {
                    measureValueFilter: {
                        measure: localIdRef("m_e519fa2a_86c3_4e32_8313_0c03062348j3"),
                        localIdentifier: "compoundFilterLocalId",
                        conditions: [
                            { comparison: { operator: "GREATER_THAN", value: 10 } },
                            { range: { operator: "BETWEEN", from: 5, to: 20 } },
                        ],
                    },
                } satisfies IMeasureValueFilter,
            ],
            [
                "measure value filter with dimensionality using local id refs",
                newMeasureValueFilterWithOptions(ReferenceMd.Won, {
                    operator: "LESS_THAN",
                    value: 200,
                    dimensionality: [localIdRef("localAttrId")],
                }),
            ],
        ];
        it.each(Scenarios)("should return %s", (_desc, input) => {
            expect(convertFilter(input as IFilter | IFilterWithApplyOnResult)).toMatchSnapshot();
        });

        it("should filter out empty negative attribute filters and not cause RAIL-2083", () => {
            const emptyPositiveFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, []);
            const emptyNegativeFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, []);

            expect(convertFilter(emptyPositiveFilter)).not.toBeNull();
            expect(convertFilter(emptyNegativeFilter)).toBeNull();
        });
    });
});
