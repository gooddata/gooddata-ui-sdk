// (C) 2020 GoodData Corporation
import { mergeFilters } from "../filterMerge";
import {
    newPositiveAttributeFilter,
    newMeasureValueFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
} from "../factory";
import { IFilter } from "..";

describe("mergeFilters", () => {
    it("should append attribute filters", () => {
        const insightFilters = [newPositiveAttributeFilter("foo", ["bar"])];
        const addedFilters = [newPositiveAttributeFilter("baz", ["other"])];

        const actual = mergeFilters(insightFilters, addedFilters);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should append measure value filters", () => {
        const insightFilters = [newMeasureValueFilter("foo", "EQUAL_TO", 42)];
        const addedFilters = [newMeasureValueFilter("bar", "BETWEEN", 0, 100)];

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
