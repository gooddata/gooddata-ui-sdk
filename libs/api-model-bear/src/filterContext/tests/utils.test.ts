// (C) 2019-2020 GoodData Corporation
import { sanitizeFiltersForExport } from "../utils";
import {
    absoluteDateFilter,
    attributeFilter,
    relativeDateFilter,
    dateFilterWithUndefinedRange,
    dependentAttributeFilter,
} from "./utils.fixtures";

describe("dashboard export utils", () => {
    describe("sanitizeFiltersForExport", () => {
        it("should leave valid attribute filter as it is", () => {
            expect(sanitizeFiltersForExport([attributeFilter])).toEqual([attributeFilter]);
        });

        it("should remove localIdentifier and filterElementsBy props from attribute filter", () => {
            expect(sanitizeFiltersForExport([dependentAttributeFilter])).toEqual([attributeFilter]);
        });

        it("should leave absolute date filter as it is", () => {
            expect(sanitizeFiltersForExport([absoluteDateFilter])).toEqual([absoluteDateFilter]);
        });

        it("should sanitize relative date filter with negative 'from' and zero 'to'", () => {
            expect(sanitizeFiltersForExport([relativeDateFilter])).toEqual([
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
            expect(sanitizeFiltersForExport([dateFilterWithUndefinedRange])).toStrictEqual([
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
