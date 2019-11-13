// (C) 2019 GoodData Corporation
import { GdcDashboardExport } from "../GdcDashboardExport";
import { sanitizeDateFilters } from "../utils";

describe("dashboard export utils", () => {
    describe("sanitizeDateFilters", () => {
        const relativeDateFilter: GdcDashboardExport.FilterContextItem = {
            dateFilter: {
                type: "relative",
                from: -11,
                to: 0,
                granularity: "GDC.time.month",
            },
        };

        const absoluteDateFilter: GdcDashboardExport.FilterContextItem = {
            dateFilter: {
                type: "absolute",
                from: "2019-08-06",
                to: "2019-08-08",
                granularity: "GDC.time.month",
            },
        };

        const attributeFilter: GdcDashboardExport.FilterContextItem = {
            attributeFilter: {
                displayForm: "/gdc/md/testProjectId/obj/700",
                negativeSelection: false,
                attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
            },
        };

        const dateFilterWithUndefinedRange: GdcDashboardExport.FilterContextItem = {
            dateFilter: {
                type: "relative",
                from: undefined,
                to: undefined,
                granularity: "GDC.time.month",
            },
        };

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
