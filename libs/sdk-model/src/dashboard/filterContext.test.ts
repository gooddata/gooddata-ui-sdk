// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { InvalidInputTestCases } from "../../__mocks__/typeGuards.js";
import { idRef } from "../objRef/factory.js";
import { type ObjRef } from "../objRef/index.js";

import {
    type IDashboardAbsoluteGranularityDateFilter,
    type IDashboardFilterReference,
    type IFilterContext,
    type ITempFilterContext,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    dashboardFilterReferenceObjRef,
    exportOverrideFilterContextIdentifier,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterReference,
    isDashboardCommonDateFilterOfAnyType,
    isDashboardDateFilter,
    isDashboardDateFilterOfAnyType,
    isDashboardDateFilterReference,
    isDashboardDateFilterWithDimensionOfAnyType,
    isDashboardParameterizedDateFilter,
    isExportOverrideFilterContext,
    isFilterContext,
    isFilterContextDefinition,
    isFilterContextItem,
    isFilterContextItemOfAnyType,
    isTempFilterContext,
    newDashboardParameterizedDateFilter,
} from "./filterContext.js";
import {
    dashboardAttributeFilter,
    dashboardAttributeFilterReference,
    dashboardDateFilter,
    dashboardDateFilterReference,
    filterContext,
    filterContextDefinition,
    tempFilterContext,
} from "./filterContext.test.helpers.js";

describe("filter context type guards", () => {
    describe("isDashboardAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard attribute filter", dashboardAttributeFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDashboardDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard date filter", dashboardDateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDashboardAttributeFilterReference", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard attribute filter reference", dashboardAttributeFilterReference],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardAttributeFilterReference(input)).toBe(expectedResult);
        });
    });

    describe("isDashboardDateFilterReference", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard date filter reference", dashboardDateFilterReference],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardDateFilterReference(input)).toBe(expectedResult);
        });
    });

    describe("dashboardFilterReferenceObjRef", () => {
        const Scenarios: Array<[ObjRef, string, IDashboardFilterReference]> = [
            [
                dashboardDateFilterReference.dataSet,
                "dashboard date filter reference",
                dashboardDateFilterReference,
            ],
            [
                dashboardAttributeFilterReference.displayForm,
                "dashboard attribute filter reference",
                dashboardAttributeFilterReference,
            ],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(dashboardFilterReferenceObjRef(input)).toBe(expectedResult);
        });
    });

    describe("isFilterContext", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "filter context", filterContext],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFilterContext(input)).toBe(expectedResult);
        });
    });

    describe("isFilterContextDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "filter context definition", filterContextDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFilterContextDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isTempFilterContext", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "temp filter context", tempFilterContext],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isTempFilterContext(input)).toBe(expectedResult);
        });
    });
});

describe("exportOverrideFilterContextIdentifier", () => {
    it("keeps the identifier literal stable (cross-version contract with federated engines)", () => {
        expect(exportOverrideFilterContextIdentifier("abc")).toBe("identifier-abc");
    });
});

describe("isExportOverrideFilterContext", () => {
    const buildOverrideFilterContext = (exportId: string): IFilterContext => {
        const identifier = exportOverrideFilterContextIdentifier(exportId);
        return {
            ref: { identifier },
            identifier,
            uri: `uri-${exportId}`,
            title: `temp-filter-context-${exportId}`,
            description: "",
            filters: [],
        };
    };

    const persistedFilterContext: IFilterContext = {
        ref: { identifier: "fc-1", type: "filterContext" },
        identifier: "fc-1",
        uri: "/fc-1",
        title: "filterContext",
        description: "",
        filters: [],
    };

    const overrideTempFilterContext: ITempFilterContext = {
        ref: { identifier: "temp-fc" },
        uri: "/temp-fc",
        created: "2026-08-20 00:00:00",
        filters: [],
    };

    it("recognizes a filter context stamped for the given export", () => {
        expect(isExportOverrideFilterContext(buildOverrideFilterContext("export-1"), "export-1")).toBe(true);
    });

    it("rejects a filter context stamped for a different export", () => {
        expect(isExportOverrideFilterContext(buildOverrideFilterContext("export-2"), "export-1")).toBe(false);
    });

    it("rejects a stamped filter context when no export id is given", () => {
        expect(isExportOverrideFilterContext(buildOverrideFilterContext("export-1"), undefined)).toBe(false);
    });

    it("rejects a persisted filter context", () => {
        expect(isExportOverrideFilterContext(persistedFilterContext, "export-1")).toBe(false);
    });

    it("recognizes a temp filter context regardless of export id", () => {
        expect(isExportOverrideFilterContext(overrideTempFilterContext, undefined)).toBe(true);
        expect(isExportOverrideFilterContext(overrideTempFilterContext, "export-1")).toBe(true);
    });

    it("rejects non-filter-context values", () => {
        expect(isExportOverrideFilterContext(undefined, "export-1")).toBe(false);
        expect(isExportOverrideFilterContext(null, "export-1")).toBe(false);
        expect(isExportOverrideFilterContext({}, "export-1")).toBe(false);
    });
});

describe("absolute date filter with granularity in the filter context", () => {
    const dataSet = idRef("closed", "dataSet");
    const granularityDateFilter: IDashboardAbsoluteGranularityDateFilter = {
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.month",
            from: "2026-01",
            to: "2026-03",
            dataSet,
            localIdentifier: "granularityDateFilter",
        },
    };

    it.each<[boolean, string, unknown]>([
        ...InvalidInputTestCases,
        [true, "absolute date filter with granularity", granularityDateFilter],
        [true, "dashboard date filter", dashboardDateFilter],
        [true, "dashboard attribute filter", dashboardAttributeFilter],
    ])("isFilterContextItemOfAnyType should return %s when input is %s", (expectedResult, _desc, input) => {
        expect(isFilterContextItemOfAnyType(input)).toBe(expectedResult);
    });

    it("is not covered by isFilterContextItem", () => {
        expect(isFilterContextItem(granularityDateFilter)).toBe(false);
    });

    it("returns its data set as the object reference", () => {
        expect(dashboardFilterObjRef(granularityDateFilter)).toEqual(dataSet);
    });

    it("returns its local identifier", () => {
        expect(dashboardFilterLocalIdentifier(granularityDateFilter)).toBe("granularityDateFilter");
    });

    it.each<[boolean, string, unknown]>([
        ...InvalidInputTestCases,
        [false, "absolute date filter with granularity and data set", granularityDateFilter],
        [
            true,
            "absolute date filter with granularity without data set",
            {
                dashboardAbsoluteGranularityDateFilter: {
                    ...granularityDateFilter.dashboardAbsoluteGranularityDateFilter,
                    dataSet: undefined,
                },
            },
        ],
        [true, "dashboard date filter without data set", dashboardDateFilter],
        [
            false,
            "dashboard date filter with data set",
            { dateFilter: { ...dashboardDateFilter.dateFilter, dataSet } },
        ],
        [false, "dashboard attribute filter", dashboardAttributeFilter],
    ])(
        "isDashboardCommonDateFilterOfAnyType should return %s when input is %s",
        (expectedResult, _desc, input) => {
            expect(isDashboardCommonDateFilterOfAnyType(input)).toBe(expectedResult);
        },
    );

    it.each<[boolean, string, unknown]>([
        ...InvalidInputTestCases,
        [true, "absolute date filter with granularity and data set", granularityDateFilter],
        [
            false,
            "absolute date filter with granularity without data set",
            {
                dashboardAbsoluteGranularityDateFilter: {
                    ...granularityDateFilter.dashboardAbsoluteGranularityDateFilter,
                    dataSet: undefined,
                },
            },
        ],
        [false, "dashboard date filter without data set", dashboardDateFilter],
        [
            true,
            "dashboard date filter with data set",
            { dateFilter: { ...dashboardDateFilter.dateFilter, dataSet } },
        ],
        [false, "dashboard attribute filter", dashboardAttributeFilter],
    ])(
        "isDashboardDateFilterWithDimensionOfAnyType should return %s when input is %s",
        (expectedResult, _desc, input) => {
            expect(isDashboardDateFilterWithDimensionOfAnyType(input)).toBe(expectedResult);
        },
    );
});

describe("parameterized date filter in the filter context", () => {
    const dataSet = idRef("closed", "dataSet");
    const parameter = idRef("period", "parameter");
    const parameterizedDateFilter = newDashboardParameterizedDateFilter(parameter, {
        dataSet,
        localIdentifier: "periodFilter",
        emptyValueHandling: "include",
    });

    it("is created with the given properties", () => {
        expect(parameterizedDateFilter).toEqual({
            dashboardParameterizedDateFilter: {
                parameter,
                dataSet,
                localIdentifier: "periodFilter",
                emptyValueHandling: "include",
            },
        });
    });

    it("is created without a data set", () => {
        expect(newDashboardParameterizedDateFilter(parameter)).toEqual({
            dashboardParameterizedDateFilter: { parameter },
        });
    });

    it("is created from a parameter identifier", () => {
        expect(newDashboardParameterizedDateFilter("period")).toEqual({
            dashboardParameterizedDateFilter: { parameter },
        });
    });

    it.each<[boolean, string, unknown]>([
        ...InvalidInputTestCases,
        [true, "parameterized date filter", parameterizedDateFilter],
        [false, "dashboard date filter", dashboardDateFilter],
        [false, "execution parameterized date filter", { parameterizedDateFilter: { dataSet, parameter } }],
        [false, "null body", { dashboardParameterizedDateFilter: null }],
    ])(
        "isDashboardParameterizedDateFilter should return %s when input is %s",
        (expectedResult, _desc, input) => {
            expect(isDashboardParameterizedDateFilter(input)).toBe(expectedResult);
        },
    );

    it("is a common date filter only without a data set", () => {
        expect(isDashboardCommonDateFilterOfAnyType(parameterizedDateFilter)).toBe(false);
        expect(isDashboardCommonDateFilterOfAnyType(newDashboardParameterizedDateFilter(parameter))).toBe(
            true,
        );
    });

    it("is a date filter with a dimension only with a data set", () => {
        expect(isDashboardDateFilterWithDimensionOfAnyType(parameterizedDateFilter)).toBe(true);
        expect(
            isDashboardDateFilterWithDimensionOfAnyType(newDashboardParameterizedDateFilter(parameter)),
        ).toBe(false);
    });

    it("is covered only by the guards of any type", () => {
        expect(isFilterContextItemOfAnyType(parameterizedDateFilter)).toBe(true);
        expect(isDashboardDateFilterOfAnyType(parameterizedDateFilter)).toBe(true);
        expect(isFilterContextItem(parameterizedDateFilter)).toBe(false);
        expect(isDashboardDateFilter(parameterizedDateFilter)).toBe(false);
    });

    it("returns its data set as the object reference", () => {
        expect(dashboardFilterObjRef(parameterizedDateFilter)).toEqual(dataSet);
    });

    it("returns its local identifier", () => {
        expect(dashboardFilterLocalIdentifier(parameterizedDateFilter)).toBe("periodFilter");
    });
});
