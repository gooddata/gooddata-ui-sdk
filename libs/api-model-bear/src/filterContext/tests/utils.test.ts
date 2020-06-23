// (C) 2019 GoodData Corporation
import { sanitizeDateFilters } from "../utils";
import {
    absoluteDateFilter,
    attributeFilter,
    relativeDateFilter,
    dateFilterWithUndefinedRange,
} from "./utils.fixtures";

describe("dashboard export utils", () => {
    describe("sanitizeDateFilters", () => {
        it("should leave attribute filter as it is", () => {
            expect(sanitizeDateFilters([attributeFilter])).toEqual([attributeFilter]);
        });

        it("should leave absolute date filter as it is", () => {
            expect(sanitizeDateFilters([absoluteDateFilter])).toEqual([absoluteDateFilter]);
        });

        it("should sanitize relative date filter with negative 'from' and zero 'to'", () => {
            expect(sanitizeDateFilters([relativeDateFilter])).toEqual([
                {
                    dateFilter: {
                        type: "relative",
                        from: "-11",
                        to: "0",
                        granularity: "GDC.time.month",
                    },
                },
            ]);
        });

        it("should remove undefined range from relative date filter", () => {
            expect(sanitizeDateFilters([dateFilterWithUndefinedRange])).toStrictEqual([
                {
                    dateFilter: {
                        type: "relative",
                        granularity: "GDC.time.month",
                    },
                },
            ]);
        });
    });
});
