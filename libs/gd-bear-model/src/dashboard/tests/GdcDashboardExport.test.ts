// (C) 2019 GoodData Corporation
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
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
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute filter", attributeFilter],
            [false, "date filter", dateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcDashboardExport.isAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute filter", attributeFilter],
            [true, "date filter", dateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcDashboardExport.isDateFilter(input)).toBe(expectedResult);
        });
    });
});
