// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    type DashboardAttributeFilterConfigMode,
    type DashboardAttributeFilterSelectionMode,
    type DashboardDateFilterConfigMode,
    type FilterContextItem,
    type IAttributeElements,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import {
    type FilterValidationErrorType,
    type IDashboardFilterMergeConfig,
    type ValidationResult,
    mergeFilterContextFilters,
} from "../dashboardFilterContextValidation.js";

const attributeDisplayFormRef = idRef("displayFormId");
const attributeDisplayFormRef2 = idRef("displayFormId2");
const dateDataSetRef = idRef("dateDataSetId");
const dateDataSetRef2 = idRef("dateDataSetId2");

const createAttributeFilter = (
    displayFormRef: ObjRef,
    localIdentifier: string,
    selectionMode: DashboardAttributeFilterSelectionMode = "multi",
    values: string[] = ["value1"],
): IDashboardAttributeFilter => ({
    attributeFilter: {
        displayForm: displayFormRef,
        negativeSelection: false,
        localIdentifier,
        attributeElements: {
            values,
        } as IAttributeElements,
        selectionMode,
    },
});

const createDateFilter = (
    dataSetRef: ObjRef | undefined,
    localIdentifier: string,
    from = -10,
    dimension?: string,
): IDashboardDateFilter => ({
    dateFilter: {
        dataSet: dataSetRef,
        localIdentifier,
        type: "relative",
        from,
        to: 0,
        granularity: "GDC.time.year",
        ...(dimension ? { dimension } : {}),
    },
});

const hasValidationError = (
    results: ValidationResult[],
    filter: FilterContextItem,
    errorType: FilterValidationErrorType,
): boolean => {
    return results.some((result) => result.error === errorType && result.filter === filter);
};

describe("dashboardFilterContextValidation", () => {
    describe("mergeFilterContextFilters", () => {
        describe("Basic attribute filter merging", () => {
            it("should merge attribute filter when there are no validation issues", () => {
                const originalFilter = createAttributeFilter(attributeDisplayFormRef, "attr1");
                const filterToMerge = createAttributeFilter(attributeDisplayFormRef, "attr1", "multi", [
                    "newValue",
                ]);

                const result = mergeFilterContextFilters([originalFilter], [filterToMerge], {});

                // The filter should be merged (replaced) successfully
                expect(result.mergedFilters.length).toBe(1);
                expect(result.validationResults.length).toBe(0);
                expect(result.mergedFilters[0]).toBe(filterToMerge);
            });

            it("should identify missing filters with validation errors", () => {
                const originalFilter = createAttributeFilter(attributeDisplayFormRef, "attr1");
                const unrelatedFilter = createAttributeFilter(attributeDisplayFormRef2, "attr2");

                const result = mergeFilterContextFilters([originalFilter], [unrelatedFilter], {});

                // Original filter is kept and missing filter validation is recorded
                expect(result.mergedFilters.length).toBe(1);
                expect(result.mergedFilters[0]).toBe(originalFilter);
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(
                        result.validationResults,
                        unrelatedFilter,
                        "cannot-apply-missing-filter",
                    ),
                ).toBe(true);
            });
        });

        describe("Filter configuration validation", () => {
            it("should keep original filter when filter is configured as hidden", () => {
                const originalFilter = createAttributeFilter(attributeDisplayFormRef, "attr1");
                const filterToMerge = createAttributeFilter(attributeDisplayFormRef, "attr1", "multi", [
                    "newValue",
                ]);
                const config: IDashboardFilterMergeConfig = {
                    attributeFilterConfigs: [
                        { localIdentifier: "attr1", mode: "hidden" as DashboardAttributeFilterConfigMode },
                    ],
                };

                const result = mergeFilterContextFilters([originalFilter], [filterToMerge], config);

                // Hidden filters should be kept as original
                expect(result.mergedFilters.length).toBe(1);
                expect(result.mergedFilters[0]).toBe(originalFilter);
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(result.validationResults, filterToMerge, "cannot-apply-hidden"),
                ).toBe(true);
            });

            it("should keep original filter when filter is configured as readonly", () => {
                const originalFilter = createAttributeFilter(attributeDisplayFormRef, "attr1");
                const filterToMerge = createAttributeFilter(attributeDisplayFormRef, "attr1", "multi", [
                    "newValue",
                ]);
                const config: IDashboardFilterMergeConfig = {
                    attributeFilterConfigs: [
                        { localIdentifier: "attr1", mode: "readonly" as DashboardAttributeFilterConfigMode },
                    ],
                };

                const result = mergeFilterContextFilters([originalFilter], [filterToMerge], config);

                // Readonly filters should be kept as original
                expect(result.mergedFilters.length).toBe(1);
                expect(result.mergedFilters[0]).toBe(originalFilter);
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(result.validationResults, filterToMerge, "cannot-apply-readonly"),
                ).toBe(true);
            });
        });

        describe("Special handling of multi-to-single filters", () => {
            it("should use only first element when multi-value filter is applied to single-value filter", () => {
                const originalFilter = createAttributeFilter(attributeDisplayFormRef, "attr1", "single");
                const filterToMerge = createAttributeFilter(attributeDisplayFormRef, "attr1", "multi", [
                    "value1",
                    "value2",
                    "value3",
                ]);

                const result = mergeFilterContextFilters([originalFilter], [filterToMerge], {});

                // Multi-value filter applied to single-value filter should keep only first element
                expect(result.mergedFilters.length).toBe(1);
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(
                        result.validationResults,
                        filterToMerge,
                        "cannot-apply-multi-to-single",
                    ),
                ).toBe(true);

                // Should create a new filter with only the first element
                const mergedFilter = result.mergedFilters[0] as IDashboardAttributeFilter;
                expect(mergedFilter).not.toBe(originalFilter);
                expect(mergedFilter).not.toBe(filterToMerge);
                expect(mergedFilter.attributeFilter.attributeElements).toEqual({
                    values: ["value1"],
                });
            });
        });

        describe("Date filter handling", () => {
            it("should merge common date filter when there are no validation issues", () => {
                const originalFilter = createDateFilter(undefined, "date1");
                const filterToMerge = createDateFilter(undefined, "date1", -5);

                const result = mergeFilterContextFilters([originalFilter], [filterToMerge], {});

                // The date filter should be merged (replaced) successfully
                expect(result.mergedFilters.length).toBe(1);
                expect(result.validationResults.length).toBe(0);
                expect(result.mergedFilters[0]).toBe(filterToMerge);
            });

            it("should merge date filter with dimension when there are no validation issues", () => {
                const originalFilter = createDateFilter(dateDataSetRef, "date1");
                const filterToMerge = createDateFilter(dateDataSetRef, "date1", -5);

                const result = mergeFilterContextFilters([originalFilter], [filterToMerge], {});

                // The date filter should be merged (replaced) successfully
                expect(result.mergedFilters.length).toBe(1);
                expect(result.validationResults.length).toBe(0);
                expect(result.mergedFilters[0]).toBe(filterToMerge);
            });

            it("should respect hidden config for common date filters", () => {
                // Common date filter (without dataSet)
                const commonOriginalFilter = createDateFilter(undefined, "date1");
                const commonFilterToMerge = createDateFilter(undefined, "date1", -5);

                const commonConfig: IDashboardFilterMergeConfig = {
                    dateFilterConfig: {
                        mode: "hidden" as DashboardDateFilterConfigMode,
                        filterName: "testFilter",
                    },
                };

                const result = mergeFilterContextFilters(
                    [commonOriginalFilter],
                    [commonFilterToMerge],
                    commonConfig,
                );

                // Verify common date filter respects hidden config
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(result.validationResults, commonFilterToMerge, "cannot-apply-hidden"),
                ).toBe(true);

                // With hidden config, common date filter should preserve original values
                expect(result.mergedFilters[0]).toBe(commonOriginalFilter);
            });

            it("should respect readonly config for common date filters", () => {
                // Common date filter (without dataSet)
                const commonOriginalFilter = createDateFilter(undefined, "date1");
                const commonFilterToMerge = createDateFilter(undefined, "date1", -5);

                const commonConfig: IDashboardFilterMergeConfig = {
                    dateFilterConfig: {
                        mode: "readonly" as DashboardDateFilterConfigMode,
                        filterName: "testFilter",
                    },
                };

                const result = mergeFilterContextFilters(
                    [commonOriginalFilter],
                    [commonFilterToMerge],
                    commonConfig,
                );

                // Verify common date filter respects readonly config
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(
                        result.validationResults,
                        commonFilterToMerge,
                        "cannot-apply-readonly",
                    ),
                ).toBe(true);

                // With readonly config, common date filter should preserve original values
                expect(result.mergedFilters[0]).toBe(commonOriginalFilter);
            });

            it("should respect hidden config for date filters with dimension", () => {
                // Date filter with dimension (with dateDataSet)
                const dimensionOriginalFilter = createDateFilter(dateDataSetRef, "date1");
                const dimensionFilterToMerge = createDateFilter(dateDataSetRef, "date1", -5);

                const dimensionConfig: IDashboardFilterMergeConfig = {
                    dateFilterConfigs: [
                        {
                            dateDataSet: dateDataSetRef,
                            config: {
                                mode: "hidden" as DashboardDateFilterConfigMode,
                                filterName: "testFilter",
                            },
                        },
                    ],
                };

                const result = mergeFilterContextFilters(
                    [dimensionOriginalFilter],
                    [dimensionFilterToMerge],
                    dimensionConfig,
                );

                // Verify dimension date filter respects hidden config
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(
                        result.validationResults,
                        dimensionFilterToMerge,
                        "cannot-apply-hidden",
                    ),
                ).toBe(true);

                // With hidden config, dimension date filter should preserve original values
                expect(result.mergedFilters[0]).toBe(dimensionOriginalFilter);
            });

            it("should respect readonly config for date filters with dimension", () => {
                // Date filter with dimension (with dateDataSet)
                const dimensionOriginalFilter = createDateFilter(dateDataSetRef, "date1");
                const dimensionFilterToMerge = createDateFilter(dateDataSetRef, "date1", -5);

                const dimensionConfig: IDashboardFilterMergeConfig = {
                    dateFilterConfigs: [
                        {
                            dateDataSet: dateDataSetRef,
                            config: {
                                mode: "readonly" as DashboardDateFilterConfigMode,
                                filterName: "testFilter",
                            },
                        },
                    ],
                };

                const result = mergeFilterContextFilters(
                    [dimensionOriginalFilter],
                    [dimensionFilterToMerge],
                    dimensionConfig,
                );

                // Verify dimension date filter respects readonly config
                expect(result.validationResults.length).toBe(1);
                expect(
                    hasValidationError(
                        result.validationResults,
                        dimensionFilterToMerge,
                        "cannot-apply-readonly",
                    ),
                ).toBe(true);

                // With readonly config, dimension date filter should preserve original values
                expect(result.mergedFilters[0]).toBe(dimensionOriginalFilter);
            });
        });

        describe("Complex scenarios", () => {
            it("should handle multiple filters with different validation results", () => {
                // Create original filters
                const attrFilter1 = createAttributeFilter(attributeDisplayFormRef, "attr1");
                const attrFilter2 = createAttributeFilter(attributeDisplayFormRef2, "attr2", "single");
                const dateFilter1 = createDateFilter(dateDataSetRef, "date1");
                const dateFilter2 = createDateFilter(dateDataSetRef2, "date2");

                const originalFilters = [attrFilter1, attrFilter2, dateFilter1, dateFilter2];

                // Create filters to merge with various conditions
                const attrFilter1ToMerge = createAttributeFilter(attributeDisplayFormRef, "attr1", "multi", [
                    "newValue",
                ]);
                const attrFilter2ToMerge = createAttributeFilter(attributeDisplayFormRef2, "attr2", "multi", [
                    "val1",
                    "val2",
                ]);
                const dateFilter1ToMerge = createDateFilter(dateDataSetRef, "date1", -5);
                const dateFilter2ToMerge = createDateFilter(dateDataSetRef2, "date2", -5);
                const missingFilter = createAttributeFilter(idRef("missingId"), "missing");

                const filtersToMerge = [
                    attrFilter1ToMerge,
                    attrFilter2ToMerge,
                    dateFilter1ToMerge,
                    dateFilter2ToMerge,
                    missingFilter,
                ];

                // Config with various restrictions
                const config: IDashboardFilterMergeConfig = {
                    attributeFilterConfigs: [
                        { localIdentifier: "attr1", mode: "readonly" as DashboardAttributeFilterConfigMode },
                    ],
                    dateFilterConfigs: [
                        {
                            dateDataSet: dateDataSetRef2,
                            config: {
                                mode: "hidden" as DashboardDateFilterConfigMode,
                                filterName: "testFilter",
                            },
                        },
                    ],
                };

                const result = mergeFilterContextFilters(originalFilters, filtersToMerge, config);

                // Verify expected behaviors
                expect(result.mergedFilters.length).toBe(4);
                expect(result.validationResults.length).toBe(4); // 3 validation errors + 1 missing filter

                // Readonly filter: kept as original
                expect(result.mergedFilters[0]).toEqual(attrFilter1);
                expect(
                    hasValidationError(result.validationResults, attrFilter1ToMerge, "cannot-apply-readonly"),
                ).toBe(true);

                // Multi-to-single filter: kept with only first value
                const secondFilter = result.mergedFilters[1] as IDashboardAttributeFilter;
                expect(secondFilter.attributeFilter.attributeElements).toEqual({ values: ["val1"] });
                expect(
                    hasValidationError(
                        result.validationResults,
                        attrFilter2ToMerge,
                        "cannot-apply-multi-to-single",
                    ),
                ).toBe(true);

                // Normal date filter: merged successfully
                expect(result.mergedFilters[2]).toBe(dateFilter1ToMerge);

                // Hidden date filter: depends on implementation behavior
                expect(
                    hasValidationError(result.validationResults, dateFilter2ToMerge, "cannot-apply-hidden"),
                ).toBe(true);

                // Missing filter: validation error recorded
                expect(
                    hasValidationError(
                        result.validationResults,
                        missingFilter,
                        "cannot-apply-missing-filter",
                    ),
                ).toBe(true);
            });
        });
    });
});
