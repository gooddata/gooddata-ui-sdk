import { GdcDashboardExport } from "../GdcDashboardExport";

describe("GdcDashboardExport", () => {
    const attributeFilter: GdcDashboardExport.IAttributeFilter = {
        attributeFilter: {
            displayForm: "/uri/attr",
            negativeSelection: true,
            attributeElements: ["/uri/attr?id=1", "/uri/attr?id=2"],
        },
    };
    const dateFilter: GdcDashboardExport.IDateFilter = {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.date",
        },
    };

    describe("isAttributeFilter", () => {
        it("should return false when null is tested", () => {
            const result = GdcDashboardExport.isAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcDashboardExport.isAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return true when attribute filter is tested", () => {
            const result = GdcDashboardExport.isAttributeFilter(attributeFilter);
            expect(result).toEqual(true);
        });

        it("should return false when date filter is tested", () => {
            const result = GdcDashboardExport.isAttributeFilter(dateFilter);
            expect(result).toEqual(false);
        });
    });

    describe("isDateFilter", () => {
        it("should return false when null is tested", () => {
            const result = GdcDashboardExport.isDateFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcDashboardExport.isDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when attribute filter is tested", () => {
            const result = GdcDashboardExport.isDateFilter(attributeFilter);
            expect(result).toEqual(false);
        });

        it("should return true when date filter is tested", () => {
            const result = GdcDashboardExport.isDateFilter(dateFilter);
            expect(result).toEqual(true);
        });
    });
});
