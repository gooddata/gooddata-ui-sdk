import { DashboardExport } from "../DashboardExport";

describe("DashboardExport", () => {
    const attributeFilter: DashboardExport.IAttributeFilter = {
        attributeFilter: {
            displayForm: "/uri/attr",
            negativeSelection: true,
            attributeElements: ["/uri/attr?id=1", "/uri/attr?id=2"],
        },
    };
    const dateFilter: DashboardExport.IDateFilter = {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.date",
        },
    };

    describe("isAttributeFilter", () => {
        it("should return false when null is tested", () => {
            const result = DashboardExport.isAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = DashboardExport.isAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return true when attribute filter is tested", () => {
            const result = DashboardExport.isAttributeFilter(attributeFilter);
            expect(result).toEqual(true);
        });

        it("should return false when date filter is tested", () => {
            const result = DashboardExport.isAttributeFilter(dateFilter);
            expect(result).toEqual(false);
        });
    });

    describe("isDateFilter", () => {
        it("should return false when null is tested", () => {
            const result = DashboardExport.isDateFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = DashboardExport.isDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when attribute filter is tested", () => {
            const result = DashboardExport.isDateFilter(attributeFilter);
            expect(result).toEqual(false);
        });

        it("should return true when date filter is tested", () => {
            const result = DashboardExport.isDateFilter(dateFilter);
            expect(result).toEqual(true);
        });
    });
});
