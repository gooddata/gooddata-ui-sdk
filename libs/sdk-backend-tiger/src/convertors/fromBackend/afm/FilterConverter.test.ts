// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AbsoluteGranularityDateFilter, type RankingFilter } from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type DateAttributeGranularity,
    type IAbsoluteDateFilter,
    type IRankingFilter,
    idRef,
    isRankingFilter,
    newAbsoluteDateFilter,
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
        it.each([
            ["MONTH", "2026-03", "2026-04", "GDC.time.month", "2026-03-01", "2026-04-30"],
            ["QUARTER", "2026-1", "2026-2", "GDC.time.quarter", "2026-01-01", "2026-06-30"],
            ["YEAR", "2025", "2026", "GDC.time.year", "2025-01-01", "2026-12-31"],
        ] as const)(
            "expands %s %s - %s to whole periods",
            (granularity, from, to, sdkGranularity, expectedFrom, expectedTo) => {
                const result = convertFilter(granularityFilter(granularity, from, to));

                expect(result).toEqual({
                    absoluteDateFilter: {
                        dataSet: idRef("closed", "dataSet"),
                        localIdentifier: undefined,
                        from: expectedFrom,
                        to: expectedTo,
                        granularity: sdkGranularity,
                    },
                });
            },
        );

        it("drops the day granularity, which is the default", () => {
            const result = convertFilter(
                granularityFilter("DAY", "2026-03-15", "2026-03-20"),
            ) as IAbsoluteDateFilter;

            expect(result.absoluteDateFilter.granularity).toBeUndefined();
            expect(result.absoluteDateFilter.from).toBe("2026-03-15");
            expect(result.absoluteDateFilter.to).toBe("2026-03-20");
        });

        it.each([
            ["an open-ended range", granularityFilter("MONTH", "2026-03", null)],
            ["a periodical granularity", granularityFilter("MONTH_OF_YEAR", "3", "4")],
            [
                "a literal that does not match the granularity",
                granularityFilter("MONTH", "2026-03-01", "2026-04"),
            ],
        ])("throws for %s", (_desc, filter) => {
            expect(() => convertFilter(filter)).toThrow();
        });

        it.each([
            ["MONTH", "2026-3", "2026-4"],
            ["YEAR", "26", "26"],
            ["DAY", "2026-3-1", "2026-3-5"],
        ] as const)(
            "throws NotSupported for %s literals %s - %s that are not in the backend format",
            (granularity, from, to) => {
                expect(() => convertFilter(granularityFilter(granularity, from, to))).toThrow(NotSupported);
            },
        );

        it.each([
            ["GDC.time.month", "2026-03-01", "2026-04-30"],
            ["GDC.time.quarter", "2026-01-01", "2026-06-30"],
            ["GDC.time.year", "2025-01-01", "2026-12-31"],
            [undefined, "2026-03-15", "2026-04-10"],
        ] as [DateAttributeGranularity | undefined, string, string][])(
            "survives a round trip through the backend format at %s",
            (granularity, from, to) => {
                const filter = newAbsoluteDateFilter(idRef("closed", "dataSet"), from, to, { granularity });

                const converted = convertFilter(convertFilterToBackend(filter)!) as IAbsoluteDateFilter;

                expect(converted.absoluteDateFilter.from).toBe(from);
                expect(converted.absoluteDateFilter.to).toBe(to);
                expect(converted.absoluteDateFilter.granularity).toBe(granularity);
            },
        );
    });
});
