// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { InvalidInputTestCases } from "../../__mocks__/typeGuards.js";
import { type ObjRef } from "../objRef/index.js";

import {
    type IDashboardFilterReference,
    type IFilterContext,
    type ITempFilterContext,
    dashboardFilterReferenceObjRef,
    exportOverrideFilterContextIdentifier,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterReference,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    isExportOverrideFilterContext,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
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
