// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type RankingFilter } from "@gooddata/api-client-tiger";
import { type IRankingFilter, idRef, isRankingFilter } from "@gooddata/sdk-model";

import { convertFilter } from "../FilterConverter.js";

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
});
