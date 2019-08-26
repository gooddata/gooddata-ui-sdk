// (C) 2019 GoodData Corporation
import { DashboardExport } from "@gooddata/typings";
import { isDateFilter, sanitizeDateFilter, sanitizeDateFilters } from "../../src/utils/export";

describe("utils for dashboard export", () => {
    describe("sanitizeDateFilters", () => {
        const relativeDateFilter: DashboardExport.FilterContextItem = {
            dateFilter: {
                type: "relative",
                from: -11,
                to: 11,
                granularity: "GDC.time.month",
            },
        };

        const absoluteDateFilter: DashboardExport.FilterContextItem = {
            dateFilter: {
                type: "absolute",
                from: "2019-08-06",
                to: "2019-08-08",
                granularity: "GDC.time.month",
            },
        };

        const attributeFilter: DashboardExport.FilterContextItem = {
            attributeFilter: {
                displayForm: "/gdc/md/testProjectId/obj/700",
                negativeSelection: false,
                attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
            },
        };

        it("should not be date filter", () => {
            expect(isDateFilter(attributeFilter)).toBe(false);
        });

        it("should be date filter", () => {
            expect(isDateFilter(relativeDateFilter)).toBe(true);
        });

        it("should sanitize date filter", () => {
            expect(sanitizeDateFilter(relativeDateFilter)).toEqual({
                dateFilter: {
                    type: "relative",
                    from: "-11",
                    to: "11",
                    granularity: "GDC.time.month",
                },
            });
        });

        it("should reduce payload", () => {
            expect(
                sanitizeDateFilter({
                    dateFilter: {
                        type: "relative",
                        from: undefined,
                        to: undefined,
                        granularity: "GDC.time.month",
                    },
                }),
            ).toEqual({
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.month",
                },
            });
        });

        it("should sanitize date filters", () => {
            expect(sanitizeDateFilters([absoluteDateFilter, relativeDateFilter, attributeFilter])).toEqual([
                {
                    dateFilter: {
                        type: "absolute",
                        from: "2019-08-06",
                        to: "2019-08-08",
                        granularity: "GDC.time.month",
                    },
                },
                {
                    dateFilter: {
                        type: "relative",
                        from: "-11",
                        to: "11",
                        granularity: "GDC.time.month",
                    },
                },
                {
                    attributeFilter: {
                        displayForm: "/gdc/md/testProjectId/obj/700",
                        negativeSelection: false,
                        attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
                    },
                },
            ]);
        });
    });
});
