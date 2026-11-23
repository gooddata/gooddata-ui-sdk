// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AbsoluteGranularityDateFilter, type RankingFilter } from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type DatePeriodGranularity,
    type IRankingFilter,
    idRef,
    isRankingFilter,
    newAbsoluteDateFilter,
    newAbsoluteGranularityDateFilter,
} from "@gooddata/sdk-model";

import { convertFilter as convertFilterToBackend } from "../../toBackend/afm/FilterConverter.js";

import { convertFilter } from "./FilterConverter.js";

const dataset = { identifier: { id: "closed", type: "dataset" } } as const;

const granularityFilter = (
    granularity: AbsoluteGranularityDateFilter["absoluteGranularityDateFilter"]["granularity"],
    from: string | null,
    to: string | null,
): AbsoluteGranularityDateFilter => ({
    absoluteGranularityDateFilter: { dataset, granularity, from, to },
});

describe("tiger filter converter from AFM to model", () => {
    describe("ranking filter", () => {
        it("converts dimensionality to attributes for a catalog (label) reference", () => {
            // Ranking filter with a catalog attribute in "Out of" — stored by Tiger as a label ref
            // in `dimensionality`. Regression test for CQ-2614: this used to be dropped entirely.
            const tigerFilter: RankingFilter = {
                rankingFilter: {
                    measures: [{ identifier: { id: "amount", type: "metric" } }],
                    dimensionality: [{ identifier: { id: "county_name", type: "label" } }],
                    operator: "TOP",
                    value: 5,
                },
            };

            const result = convertFilter(tigerFilter);
            expect(isRankingFilter(result)).toBe(true);
            const ranking = result as IRankingFilter;

            // measure ref is normalized (metric -> measure), mirroring MeasureValueFilter handling
            expect(ranking.rankingFilter.measure).toEqual(idRef("amount", "measure"));
            // dimensionality label ref becomes an SDK displayForm ref under `attributes`
            expect(ranking.rankingFilter.attributes).toEqual([idRef("county_name", "displayForm")]);
            expect(ranking.rankingFilter.operator).toBe("TOP");
            expect(ranking.rankingFilter.value).toBe(5);
        });

        it("omits attributes when the ranking filter has no dimensionality", () => {
            const tigerFilter: RankingFilter = {
                rankingFilter: {
                    measures: [{ identifier: { id: "amount", type: "metric" } }],
                    operator: "BOTTOM",
                    value: 3,
                },
            };

            const result = convertFilter(tigerFilter);
            expect(isRankingFilter(result)).toBe(true);
            const ranking = result as IRankingFilter;

            expect(ranking.rankingFilter.measure).toEqual(idRef("amount", "measure"));
            expect(ranking.rankingFilter.attributes).toBeUndefined();
            expect(ranking.rankingFilter.operator).toBe("BOTTOM");
            expect(ranking.rankingFilter.value).toBe(3);
        });
    });
    describe("absolute granularity date filter", () => {
        const dataSet = idRef("closed", "dataSet");

        it.each([
            ["WEEK", "2026-05", "2026-08", "GDC.time.week"],
            ["MONTH", "2026-03", "2026-04", "GDC.time.month"],
            ["QUARTER", "2026-1", "2026-2", "GDC.time.quarter"],
            ["YEAR", "2025", "2026", "GDC.time.year"],
        ] as const)("reads %s %s - %s with its granularity", (granularity, from, to, sdkGranularity) => {
            expect(convertFilter(granularityFilter(granularity, from, to))).toEqual(
                newAbsoluteGranularityDateFilter(dataSet, sdkGranularity, from, to),
            );
        });

        it.each([
            ["2026-03", null, newAbsoluteGranularityDateFilter(dataSet, "GDC.time.month", "2026-03")],
            [
                null,
                "2026-04",
                newAbsoluteGranularityDateFilter(dataSet, "GDC.time.month", undefined, "2026-04"),
            ],
        ] as const)("reads an open range %s - %s", (from, to, expected) => {
            expect(convertFilter(granularityFilter("MONTH", from, to))).toEqual(expected);
        });

        it("reads days as an absolute date filter without granularity", () => {
            expect(convertFilter(granularityFilter("DAY", "2026-03-15", "2026-03-20"))).toEqual(
                newAbsoluteDateFilter(dataSet, "2026-03-15", "2026-03-20"),
            );
        });

        it.each([
            ["an open range of days", granularityFilter("DAY", "2026-03-15", null)],
            ["a range without edges", granularityFilter("MONTH", null, null)],
            ["a periodical granularity", granularityFilter("MONTH_OF_YEAR", "3", "4")],
            ["a day at the month granularity", granularityFilter("MONTH", "2026-03-01", "2026-04")],
            ["a range that ends before it starts", granularityFilter("MONTH", "2026-04", "2026-03")],
            ["a week 53 in a year with 52 weeks", granularityFilter("WEEK", "2025-53", "2025-53")],
            ["a month that is not zero-padded", granularityFilter("MONTH", "2026-3", "2026-4")],
            ["a short year", granularityFilter("YEAR", "26", "26")],
            ["a day that is not zero-padded", granularityFilter("DAY", "2026-3-1", "2026-3-5")],
        ])("throws NotSupported for %s", (_desc, filter) => {
            expect(() => convertFilter(filter)).toThrow(NotSupported);
        });

        it.each([
            ["GDC.time.week", "2026-05", "2026-08"],
            ["GDC.time.week", "2026-53", "2026-53"],
            ["GDC.time.month", "2026-03", "2026-04"],
            ["GDC.time.quarter", "2026-1", "2026-2"],
            ["GDC.time.year", "2025", "2026"],
            ["GDC.time.month", "2026-03", undefined],
            ["GDC.time.month", undefined, "2026-04"],
        ] as [DatePeriodGranularity, string | undefined, string | undefined][])(
            "survives a round trip through the backend at %s %s - %s",
            (granularity, from, to) => {
                const options = { localIdentifier: "date", emptyValueHandling: "exclude" } as const;
                const filter =
                    from === undefined
                        ? newAbsoluteGranularityDateFilter(dataSet, granularity, undefined, to!, options)
                        : newAbsoluteGranularityDateFilter(dataSet, granularity, from, to, options);

                expect(convertFilter(convertFilterToBackend(filter)!)).toEqual(filter);
            },
        );

        it("keeps days as days in a round trip through the backend", () => {
            const filter = newAbsoluteDateFilter(dataSet, "2026-03-15", "2026-04-10");

            expect(convertFilter(convertFilterToBackend(filter)!)).toEqual(filter);
        });

        it.each([
            ["GDC.time.week_us", "2026-03-01", "2026-03-14"],
            ["GDC.time.month", "2026-03-01", "2026-04-30"],
            ["GDC.time.quarter", "2026-01-01", "2026-06-30"],
            ["GDC.time.year", "2025-01-01", "2026-12-31"],
        ] as const)("reads days at the %s granularity back as days", (granularity, from, to) => {
            const filter = newAbsoluteDateFilter(dataSet, from, to, { granularity });

            expect(convertFilter(convertFilterToBackend(filter)!)).toEqual(
                newAbsoluteDateFilter(dataSet, from, to),
            );
        });
    });
});
