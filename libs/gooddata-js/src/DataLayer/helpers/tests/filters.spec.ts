// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { isEmptyFilter, mergeFilters } from "../filters";
import * as input from "./filters.input.fixtures";

const EMPTY_FILTER_TESTS = [
    ["non empty positive filter", input.positiveAttributeFilter, false],
    ["non empty negative filter", input.negativeAttributeFilter, false],
    ["empty positive filter", input.positiveAttributeFilterEmpty, true],
    ["empty negative filter", input.negativeAttributeFilterEmpty, true],
    ["absolute date filter", input.absoluteDateFilter, false],
    ["relative date filter", input.relativeDateFilter, false],
];

describe.each(EMPTY_FILTER_TESTS)("isEmptyFilter", (desc, input, expected) => {
    it(`should return ${expected} for ${desc}`, () => {
        expect(isEmptyFilter(input)).toEqual(expected);
    });
});

describe("mergeFilters", () => {
    it("should concat existing filters with user filters", () => {
        const expectedAfm: AFM.IAfm = {
            filters: [
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            identifier: "filter",
                        },
                        in: ["1", "2", "3"],
                    },
                },
                input.positiveAttributeFilter,
            ],
        };

        expect(mergeFilters(input.afm, [input.positiveAttributeFilter])).toEqual(expectedAfm);
    });

    it("should handle AFM without filters", () => {
        const expectedAfm: AFM.IAfm = {
            filters: [input.positiveAttributeFilter],
        };

        expect(mergeFilters({}, [input.positiveAttributeFilter])).toEqual(expectedAfm);
    });

    it("should handle AFM with empty filters array", () => {
        const expectedAfm: AFM.IAfm = {
            filters: [input.positiveAttributeFilter],
        };

        expect(mergeFilters(input.afmEmptyFilters, [input.positiveAttributeFilter])).toEqual(expectedAfm);
    });

    it("should filter out empty filters", () => {
        expect(mergeFilters(input.afm, [input.positiveAttributeFilterEmpty])).toEqual(input.afm);
    });
});
