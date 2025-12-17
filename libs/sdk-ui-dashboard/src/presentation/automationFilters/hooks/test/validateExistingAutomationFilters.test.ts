// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAttributeFilter,
    type IAutomationVisibleFilter,
    type IFilterableWidget,
    type IInsight,
    type IInsightWidget,
    dashboardFilterLocalIdentifier,
    idRef,
    isAllTimeDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newPositiveAttributeFilter,
    newRelativeDashboardDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters/filterConverters.js";
import { validateExistingAutomationFilters } from "../useValidateExistingAutomationFilters.js";

const commonDataSetRef = idRef("commonDataSet", "dataSet");
const nonCommonDataSetRef = idRef("nonCommonDataSet", "dataSet");

const widget = {
    type: "insight",
    ref: { identifier: "insightWidget" },
    dateDataSet: commonDataSetRef,
    insight: idRef("insight", "insight"),
    title: "Insight",
    uri: "/uri",
    visualizationUrl: "local:headline",
    filters: [],
    description: "Insight",
    identifier: "insightWidget",
    drills: [],
    ignoreDashboardFilters: [],
} as IInsightWidget;

const insight = {
    insight: {
        buckets: [],
        identifier: "insight",
        ref: { identifier: "insight" },
        properties: {},
        sorts: [],
        title: "Insight",
        uri: "/uri",
        visualizationUrl: "local:headline",
        filters: [],
    },
} as IInsight;

const commonDateFilterLocalIdentifier = "commonDateFilter";
const allTimeCommonDateFilterContextItem: FilterContextItem = newAllTimeDashboardDateFilter(
    undefined,
    commonDateFilterLocalIdentifier,
);
const nonAllTimeCommonDateFilterContextItem: FilterContextItem = newRelativeDashboardDateFilter(
    "GDC.time.date",
    1,
    2,
    undefined,
    commonDateFilterLocalIdentifier,
);
const changedCommonDateFilterContextItem: FilterContextItem = newRelativeDashboardDateFilter(
    "GDC.time.date",
    3,
    4,
    undefined,
    commonDateFilterLocalIdentifier,
);

const nonCommonDateFilterLocalIdentifier = "nonCommonDateFilter";
const allTimeDateFilterContextItem: FilterContextItem = newAllTimeDashboardDateFilter(
    nonCommonDataSetRef,
    nonCommonDateFilterLocalIdentifier,
);
const nonAllTimeDateFilterContextItem: FilterContextItem = newRelativeDashboardDateFilter(
    "GDC.time.date",
    1,
    2,
    nonCommonDataSetRef,
    nonCommonDateFilterLocalIdentifier,
);
const changedNonAllTimeDateFilterContextItem: FilterContextItem = newRelativeDashboardDateFilter(
    "GDC.time.date",
    3,
    4,
    nonCommonDataSetRef,
    nonCommonDateFilterLocalIdentifier,
);
const nonCommonFilterContextItemWithCommonDataSet: FilterContextItem = newRelativeDashboardDateFilter(
    "GDC.time.date",
    1,
    2,
    commonDataSetRef,
    nonCommonDateFilterLocalIdentifier,
);

const attributeFilterContextItem: FilterContextItem = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute",
        },
        negativeSelection: true,
        attributeElements: {
            values: ["element"],
        },
        localIdentifier: "attribute",
    },
};
const unchangedAttributeFilterContextItem: FilterContextItem = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute",
        },
        negativeSelection: true,
        attributeElements: {
            // Handle also uris vs values change, with same elements (should be still valid)
            uris: ["element"],
        },
        localIdentifier: "attribute",
    },
};
const changedAttributeFilterContextItem: FilterContextItem = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute",
        },
        negativeSelection: false,
        attributeElements: {
            values: ["changedElement"],
        },
        localIdentifier: "attribute",
    },
};

const commonInsightNonAllTimeDateFilter = newRelativeDateFilter(commonDataSetRef, "GDC.time.date", 1, 2);
const nonCommonInsightNonAllTimeDateFilter = newRelativeDateFilter(
    nonCommonDataSetRef,
    "GDC.time.date",
    1,
    2,
);

const insightAttributeFilter = newPositiveAttributeFilter(
    idRef("attribute", "attribute"),
    ["element"],
    "insightAttribute",
);

const sliceAttributeFilter: IAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: {
            localIdentifier: "attribute",
        },
        in: {
            values: ["element"],
        },
    },
};

const [
    nonAllTimeCommonDateFilter,
    changedCommonDateFilter,
    nonAllTimeDateFilter,
    changedNonAllTimeDateFilter,
    nonCommonFilterWithCommonDataSet,
    attributeFilter,
    unchangedAttributeFilter,
    changedAttributeFilter,
] = filterContextItemsToDashboardFiltersByWidget(
    [
        // common date filters
        nonAllTimeCommonDateFilterContextItem,
        changedCommonDateFilterContextItem,
        // non-common date filters
        nonAllTimeDateFilterContextItem,
        changedNonAllTimeDateFilterContextItem,
        nonCommonFilterContextItemWithCommonDataSet,
        // attribute filters
        attributeFilterContextItem,
        unchangedAttributeFilterContextItem,
        changedAttributeFilterContextItem,
    ],
    widget as IFilterableWidget,
);

const [
    // common date filters
    allTimeCommonDateVisibleFilter,
    nonAllTimeCommonDateVisibleFilter,
    // non-common date filters
    allTimeDateVisibleFilter,
    nonAllTimeDateVisibleFilter,
    nonCommonFilterWithCommonDataSetVisibleFilter,
    // attribute filters
    attributeVisibleFilter,
] = [
    // common date filters
    allTimeCommonDateFilterContextItem,
    nonAllTimeCommonDateFilterContextItem,
    // non-common date filters
    allTimeDateFilterContextItem,
    nonAllTimeDateFilterContextItem,
    nonCommonFilterContextItemWithCommonDataSet,
    // attribute filters
    attributeFilterContextItem,
].map((filterContexItem): IAutomationVisibleFilter => {
    return {
        localIdentifier: dashboardFilterLocalIdentifier(filterContexItem),
        isAllTimeDateFilter: isAllTimeDashboardDateFilter(filterContexItem),
        title: "not relevant for validation",
    };
});

describe("validateExistingAutomationFilters", () => {
    //
    // Hidden filters
    //

    describe("hidden filters", () => {
        it("should be valid with empty hidden filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved hidden attribute filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [attributeFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [attributeFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved hidden common date filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeCommonDateFilter],
                savedAutomationVisibleFilters: [nonAllTimeCommonDateVisibleFilter],
                hiddenFilters: [nonAllTimeCommonDateFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved hidden non-common date filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeDateFilter],
                savedAutomationVisibleFilters: [nonAllTimeDateVisibleFilter],
                hiddenFilters: [nonAllTimeDateFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved hidden filters, handling uris vs values change", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [unchangedAttributeFilter],
                savedAutomationVisibleFilters: [attributeVisibleFilter],
                hiddenFilters: [attributeFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with hidden all-time date filters that are missing in saved automation filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [allTimeCommonDateVisibleFilter, allTimeDateVisibleFilter],
                hiddenFilters: [allTimeCommonDateFilterContextItem, allTimeDateFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [allTimeCommonDateFilterContextItem, allTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be invalid when hidden attribute filter is changed in saved automation filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [changedAttributeFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [attributeFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(true);
        });

        it("should be invalid when hidden common date filter is changed in saved automation filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [changedCommonDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [nonAllTimeCommonDateFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(true);
        });

        it("should be invalid when hidden non-common date filter is changed in saved automation filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [changedNonAllTimeDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [nonAllTimeDateFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(false);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(true);
        });

        it("should be invalid when hidden attribute filter is missing in saved automation filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [attributeFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(true);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be invalid when hidden common date filter is missing in saved automation filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [nonAllTimeCommonDateFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(true);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be invalid when hidden non-common date filter is missing in saved automation filters", () => {
            const {
                isValid,
                hiddenFilterIsMissingInSavedFilters,
                hiddenFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [nonAllTimeDateFilterContextItem],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(hiddenFilterIsMissingInSavedFilters).toBe(true);
            expect(hiddenFilterHasDifferentValueInSavedFilter).toBe(false);
        });
    });

    //
    // Locked filters
    //

    describe("locked filters", () => {
        it("should be valid with empty locked filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved locked attribute filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [attributeFilter],
                savedAutomationVisibleFilters: [attributeVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [attributeFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved locked common date filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeCommonDateFilter],
                savedAutomationVisibleFilters: [nonAllTimeCommonDateVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [nonAllTimeCommonDateFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved locked non-common date filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeDateFilter],
                savedAutomationVisibleFilters: [nonAllTimeDateVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [nonAllTimeDateFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with unchanged saved locked filters, handling uris vs values change", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [unchangedAttributeFilter],
                savedAutomationVisibleFilters: [attributeVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [attributeFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be valid with locked all-time date filters that are missing in saved automation filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [allTimeCommonDateVisibleFilter, allTimeDateVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [allTimeCommonDateFilterContextItem, allTimeDateFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [allTimeCommonDateFilterContextItem, allTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be invalid when locked attribute filter is changed in saved automation filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [changedAttributeFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [attributeFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [allTimeCommonDateFilterContextItem, allTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(true);
        });

        it("should be invalid when locked common date filter is changed in saved automation filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [changedCommonDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [nonAllTimeCommonDateFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(true);
        });

        it("should be invalid when locked non-common date filter is changed in saved automation filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [changedNonAllTimeDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [nonAllTimeDateFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(lockedFilterIsMissingInSavedFilters).toBe(false);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(true);
        });

        it("should be invalid when locked attribute filter is missing in saved automation filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [attributeFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(lockedFilterIsMissingInSavedFilters).toBe(true);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be invalid when locked common date filter is missing in saved automation filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [nonAllTimeCommonDateFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(lockedFilterIsMissingInSavedFilters).toBe(true);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });

        it("should be invalid when hidden non-common date filter is missing in saved automation filters", () => {
            const {
                isValid,
                lockedFilterIsMissingInSavedFilters,
                lockedFilterHasDifferentValueInSavedFilter,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [nonAllTimeDateFilterContextItem],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(lockedFilterIsMissingInSavedFilters).toBe(true);
            expect(lockedFilterHasDifferentValueInSavedFilter).toBe(false);
        });
    });

    //
    // Ignored filters
    //

    describe("ignored filters", () => {
        it("should be valid with empty ignored filters", () => {
            const { isValid, ignoredFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(ignoredFilterIsAppliedInSavedFilters).toBe(false);
        });

        it("should be valid with all-time date filters in ignored filters", () => {
            const { isValid, ignoredFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [allTimeCommonDateFilterContextItem, allTimeDateFilterContextItem],
                dashboardFilters: [allTimeCommonDateFilterContextItem, allTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(ignoredFilterIsAppliedInSavedFilters).toBe(false);
        });

        it("should be invalid with ignored attribute filter saved in automation filters", () => {
            const { isValid, ignoredFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [attributeFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [attributeFilterContextItem],
                dashboardFilters: [attributeFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(ignoredFilterIsAppliedInSavedFilters).toBe(true);
        });

        it("should be invalid with ignored common date filter saved in automation filters", () => {
            const { isValid, ignoredFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeCommonDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [nonAllTimeCommonDateFilterContextItem],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(ignoredFilterIsAppliedInSavedFilters).toBe(true);
        });

        it("should be invalid with ignored non-common date filter saved in automation filters", () => {
            const { isValid, ignoredFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [nonAllTimeDateFilterContextItem],
                dashboardFilters: [nonAllTimeDateFilterContextItem],
                widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(ignoredFilterIsAppliedInSavedFilters).toBe(true);
        });
    });

    //
    // Removed filters
    //

    describe("removed filters", () => {
        it("should be valid with empty filters", () => {
            const { isValid, removedFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(removedFilterIsAppliedInSavedFilters).toBe(false);
        });

        it("should be valid with saved ad-hoc slicing attribute filter that is missing in insight", () => {
            const { isValid, removedFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [sliceAttributeFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(removedFilterIsAppliedInSavedFilters).toBe(false);
        });

        it("should be invalid with attribute filter removed from dashboard", () => {
            const { isValid, removedFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [attributeFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(removedFilterIsAppliedInSavedFilters).toBe(true);
        });

        it("should be invalid with date filter removed from dashboard", () => {
            const { isValid, removedFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(removedFilterIsAppliedInSavedFilters).toBe(true);
        });

        it("should be invalid with attribute filter removed from insight", () => {
            const { isValid, removedFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [insightAttributeFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(removedFilterIsAppliedInSavedFilters).toBe(true);
        });

        it("should be invalid with common date filter removed from insight", () => {
            const { isValid, removedFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [commonInsightNonAllTimeDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(removedFilterIsAppliedInSavedFilters).toBe(true);
        });

        it("should be invalid with non-common date filter removed from insight", () => {
            const { isValid, removedFilterIsAppliedInSavedFilters } = validateExistingAutomationFilters({
                savedAutomationFilters: [nonCommonInsightNonAllTimeDateFilter],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(removedFilterIsAppliedInSavedFilters).toBe(true);
        });
    });

    //
    // Visible filters
    //

    describe("visible filters", () => {
        it("should be valid with empty filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(false);
            expect(visibleFilterIsMissingInSavedFilters).toBe(false);
        });

        it("should be invalid with visible attribute filter missing in saved automation filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [attributeVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(false);
            expect(visibleFilterIsMissingInSavedFilters).toBe(true);
        });

        it("should be valid with visible all-time common date filter missing in saved automation filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [allTimeCommonDateVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(false);
            expect(visibleFilterIsMissingInSavedFilters).toBe(false);
        });

        it("should be invalid with visible common date filter missing in saved automation filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [nonAllTimeCommonDateVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(false);
            expect(visibleFilterIsMissingInSavedFilters).toBe(true);
        });

        it("should be valid with visible all-time date filter missing in saved automation filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [allTimeDateVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(true);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(false);
            expect(visibleFilterIsMissingInSavedFilters).toBe(false);
        });

        it("should be invalid with visible date filter missing in saved automation filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [nonAllTimeDateVisibleFilter],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(false);
            expect(visibleFilterIsMissingInSavedFilters).toBe(true);
        });

        it("should be invalid with non-ignored all-time common date filter missing in saved automation visible filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [allTimeCommonDateFilterContextItem],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(true);
            expect(visibleFilterIsMissingInSavedFilters).toBe(false);
        });

        it("should be invalid with non-ignored common date filter missing in saved automation visible filters", () => {
            const {
                isValid,
                commonDateFilterIsMissingInSavedVisibleFilters,
                visibleFilterIsMissingInSavedFilters,
            } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: [],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(commonDateFilterIsMissingInSavedVisibleFilters).toBe(true);
            expect(visibleFilterIsMissingInSavedFilters).toBe(false);
        });

        it("should be invalid when visible filters are missing", () => {
            const { isValid, visibleFiltersAreMissing } = validateExistingAutomationFilters({
                savedAutomationFilters: [],
                savedAutomationVisibleFilters: undefined,
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [nonAllTimeCommonDateFilterContextItem],
                widget: widget,
                insight,
            });

            expect(isValid).toBe(false);
            expect(visibleFiltersAreMissing).toBe(true);
        });
    });

    //
    // Multiple date filters
    //

    describe("multiple date filters", () => {
        // This is possible when you have additional date filter in the dashboard filter context,
        // which has the same date dataset as the common date filter.
        it("should be valid with 2 date filters with the common date dataset", () => {
            const result = validateExistingAutomationFilters({
                savedAutomationFilters: [nonAllTimeCommonDateFilter, nonCommonFilterWithCommonDataSet],
                savedAutomationVisibleFilters: [
                    nonAllTimeCommonDateVisibleFilter,
                    nonCommonFilterWithCommonDataSetVisibleFilter,
                ],
                hiddenFilters: [],
                lockedFilters: [],
                ignoredFilters: [],
                dashboardFilters: [
                    nonAllTimeCommonDateFilterContextItem,
                    nonCommonFilterContextItemWithCommonDataSet,
                ],
            });

            expect(result.isValid).toBe(true);
        });
    });
});
