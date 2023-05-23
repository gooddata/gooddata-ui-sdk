// (C) 2020 GoodData Corporation
import { mergeFilters } from "../filterMerge.js";
import {
    newPositiveAttributeFilter,
    newMeasureValueFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newRankingFilter,
} from "../factory.js";
import { IFilter } from "../index.js";

describe("mergeFilters", () => {
    it("should append attribute filters", () => {
        const insightFilters = [newPositiveAttributeFilter("foo", ["bar"])];
        const addedFilters = [newPositiveAttributeFilter("baz", ["other"])];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should append measure value filters for different measures", () => {
        const insightFilters = [newMeasureValueFilter("foo", "EQUAL_TO", 42)];
        const addedFilters = [newMeasureValueFilter("bar", "BETWEEN", 0, 100)];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should merge measure value filters for the same measure", () => {
        const insightFilters = [newMeasureValueFilter("foo", "EQUAL_TO", 42)];
        const addedFilters = [newMeasureValueFilter("foo", "BETWEEN", 0, 100)];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual(addedFilters);
    });

    it("should append ranking filters for different measures", () => {
        const insightFilters = [newRankingFilter("foo", "TOP", 5)];
        const addedFilters = [newRankingFilter("bar", "TOP", 3)];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should append ranking filters the same measure", () => {
        const insightFilters = [newRankingFilter("foo", "TOP", 5)];
        const addedFilters = [newRankingFilter("foo", "BOTTOM", 3)];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should append date filters from different dimension", () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters = [newAbsoluteDateFilter("bar", "2020-01-01", "2020-12-31")];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should use added date filter if the added filter has same dimension and is NOT all time", () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters = [newAbsoluteDateFilter("foo", "2010-01-01", "2010-12-31")];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual(addedFilters);
    });

    it("should remove date filter if the added filter has same dimension and is all time", () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters: IFilter[] = [newAllTimeFilter("foo")];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual([]);
    });
});
