// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IInsight, type ITotal, idRef, uriRef } from "@gooddata/sdk-model";
import { ErrorCodes } from "@gooddata/sdk-ui";

import { LOCAL_COLUMN, LOCAL_PUSHPIN, LOCAL_TABLE } from "../constants/visualization_types.js";
import { metadataToBuckets } from "../models/metadata.js";
import { itemCache as catalogEntries } from "../models/metadata.test.helpers.js";
import { getVisualizationObjectForSave } from "../services/report_service.js";
import { type IInsightUsageOnDashboard } from "../store/insight_usage/insight_usage_state.js";
import { type IAppState } from "../store/types.js";
import { withBucketItems } from "../tests/buckets_builder.test.helpers.js";
import {
    closedDateDataset,
    setupAppStateWithDateDatasetMeta,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";
import { withMdObjectContent } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withReport, withRoot } from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import { type IReportContent } from "../typings/report.js";
import { convertModelInsightToADRep } from "../utils/sdkModelToADRep/InsightConverter.js";

import { getInsightForSaveViaMd, getInsightWithBucketsViaMd } from "./insight_selectors.js";
import {
    isSavedReportCurrentReport,
    isUsedOnOtherThanSourceDashboard,
    prepareForComparison,
    saveAsNewReportSelector,
    saveReportSelector,
} from "./save_report_selector.js";

/** Fixture builder: applies TYPED patches in sequence, each naming the branch it targets. */
function withWrites(base: IAppState, build: (set: (apply: (s: IAppState) => IAppState) => void) => void) {
    let built = base;
    build((apply) => {
        built = apply(built);
    });
    return built;
}

const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());

const validReportWithoutChanges = withWrites(stateWithDateDatasetMeta, (set) => {
    set((s) => withData(s, { visualizationClass: tableVisualizationClass }));
    set((s) => withReport(s, { execution: { ...s.report.execution, hasData: true } }));
    set((s) =>
        withReport(s, {
            lastSavedObject: {
                ...s.report.lastSavedObject,
                visualizationObject: {
                    ...s.report.lastSavedObject?.visualizationObject,
                    content: {
                        buckets: [],
                        visualizationClass: { uri: LOCAL_TABLE },
                        properties: "{}",
                    },
                },
            } as never,
        }),
    );
});

const validReportWithChanges = withWrites(stateWithDateDatasetMeta, (set) => {
    set((s) => withData(s, { visualizationClass: tableVisualizationClass }));
    set((s) => withReport(s, { execution: { ...s.report.execution, hasData: true } }));
    set((s) =>
        withReport(s, {
            lastSavedObject: {
                ...s.report.lastSavedObject,
                visualizationObject: {
                    ...s.report.lastSavedObject?.visualizationObject,
                    content: {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: [
                                    {
                                        measure: {
                                            localIdentifier: "m1",
                                            definition: {
                                                measureDefinition: {
                                                    item: {
                                                        uri: "gd/md",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                        filters: [],
                        visualizationClass: { uri: LOCAL_TABLE },
                    },
                },
            } as never,
        }),
    );
});

const reportContent: IReportContent = {
    buckets: [],
    filters: [],
    visualizationClass: { uri: LOCAL_TABLE },
};

const bucketsOrder1Report: IReportContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: "m1",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "gd/md",
                                },
                            },
                        },
                    },
                },
            ],
        },
        {
            localIdentifier: "view",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a2",
                        displayForm: {
                            uri: "gd/md/a2",
                        },
                    },
                },
            ],
        },
        {
            localIdentifier: "stack",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "gd/md/a1",
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: { uri: "visualizationClassUri" },
};

const booleanValuesReport: IReportContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: "m1",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "gd/md",
                                },
                                computeRatio: null,
                            },
                        },
                    },
                },
            ],
        },
        {
            localIdentifier: "view",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a2",
                        displayForm: {
                            uri: "gd/md/a2",
                        },
                    },
                },
            ],
        },
        {
            localIdentifier: "stack",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "gd/md/a1",
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: { uri: "visualizationClassUri" },
};

const titleReport: IReportContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: "m1",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "gd/md",
                                },
                            },
                        },
                        title: "test",
                        format: "#,##0.00%",
                    },
                },
            ],
        },
        {
            localIdentifier: "view",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a2",
                        displayForm: {
                            uri: "gd/md/a2",
                        },
                    },
                },
            ],
        },
        {
            localIdentifier: "stack",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "gd/md/a1",
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: { uri: "visualizationClassUri" },
};

const propertiesReport = {
    buckets: [],
    filters: [],
    properties: '{ "sortItems": [{ "direction": "asc" }] }',
} as IReportContent;

const measureValueFilterReport = {
    buckets: [],
    filters: [
        {
            measureValueFilter: {
                condition: undefined,
                measure: {
                    localIdentifier: "m1",
                },
            },
        },
        {
            measureValueFilter: {
                condition: {
                    comparison: {
                        operator: "GREATER_THAN",
                        value: 100,
                    },
                },
                measure: {
                    localIdentifier: "m2",
                },
            },
        },
        {
            negativeAttributeFilter: {
                displayForm: {
                    uri: "gd/md/a1",
                },
                notIn: [],
            },
        },
    ],
} as unknown as IReportContent;

const reportWithChangedTitle = withWrites(stateWithDateDatasetMeta, (set) => {
    set((s) => withData(s, { visualizationClass: tableVisualizationClass }));
    set((s) => withData(s, { title: "updated title" }));
    set((s) =>
        withReport(s, {
            lastSavedObject: {
                ...s.report.lastSavedObject,
                visualizationObject: {
                    ...s.report.lastSavedObject?.visualizationObject,
                    content: reportContent,
                },
            } as never,
        }),
    );
    set((s) => withReport(s, { execution: { ...s.report.execution, hasData: true } }));
});

const reportEmpty = withWrites(stateWithDateDatasetMeta, (set) => {
    set((s) => withData(s, { visualizationClass: tableVisualizationClass }));
    set((s) => withData(s, { title: "updated title" }));
    set((s) =>
        withReport(s, {
            lastSavedObject: {
                ...s.report.lastSavedObject,
                visualizationObject: {
                    ...s.report.lastSavedObject?.visualizationObject,
                    content: reportContent,
                },
            } as never,
        }),
    );
    set((s) => withReport(s, { execution: { ...s.report.execution, hasData: true } }));
});

const reportTooLarge = withWrites(stateWithDateDatasetMeta, (set) => {
    set((s) => withData(s, { visualizationClass: tableVisualizationClass }));
    set((s) => withData(s, { title: "updated title" }));
    set((s) =>
        withReport(s, {
            lastSavedObject: {
                ...s.report.lastSavedObject,
                visualizationObject: {
                    ...s.report.lastSavedObject?.visualizationObject,
                    content: reportContent,
                },
            } as never,
        }),
    );
    set((s) =>
        withReport(s, {
            execution: {
                ...s.report.execution,
                error: {
                    status: ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY,
                },
            },
        }),
    );
});

const protectedReportWithChanges = withWrites(stateWithDateDatasetMeta, (set) => {
    set((s) => withData(s, { visualizationClass: tableVisualizationClass }));
    set((s) => withData(s, { title: "updated title" }));
    set((s) =>
        withReport(s, {
            lastSavedObject: {
                ...s.report.lastSavedObject,
                visualizationObject: {
                    ...s.report.lastSavedObject?.visualizationObject,
                    content: {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: [
                                    {
                                        measure: {
                                            localIdentifier: "m1",
                                            definition: {
                                                measureDefinition: {
                                                    item: {
                                                        uri: "gd/md",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                        filters: [],
                        visualizationClass: { uri: LOCAL_TABLE },
                    },
                },
            } as never,
        }),
    );
    set((s) =>
        withReport(s, {
            execution: {
                ...s.report.execution,
                error: {
                    status: ErrorCodes.PROTECTED_REPORT,
                },
            },
        }),
    );
});

const reportWithSubtotalsAndSort = withWrites(getInitializedState(), (set) => {
    set((s) => withData(s, { visualizationClass: tableVisualizationClass }));
    set((s) =>
        withData(s, {
            itemCache: {
                "metric.m1": {
                    title: "m1",
                    uri: "/gdc/md/1",
                    ref: {
                        uri: "/gdc/md/1",
                    },
                },
                "attribute.a1": {
                    title: "a1",
                    displayForm: { uri: "/gdc/md/2" },
                    dfRef: {
                        uri: "/gdc/md/2",
                    },
                },
                "attribute.a2": {
                    title: "a2",
                    dfRef: {
                        uri: "/gdc/md/3",
                    },
                    displayForm: { uri: "/gdc/md/3" },
                },
            },
        }),
    );
    set((s) =>
        withData(s, {
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            localIdentifier: "m1",
                            attribute: "m1",
                            type: "metric",
                        },
                    ],
                },
                {
                    localIdentifier: "attributes",
                    items: [
                        {
                            localIdentifier: "a1",
                            type: "attribute",
                            attribute: "a1",
                        },
                        {
                            localIdentifier: "a2",
                            type: "attribute",
                            attribute: "a2",
                        },
                    ],
                    totals: [
                        {
                            attributeIdentifier: "a2",
                            measureIdentifier: "m1",
                            type: "sum",
                        },
                    ],
                },
            ],
        }),
    );
    set((s) =>
        withData(s, {
            extendedReferencePoint: {
                properties: {
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: "asc",
                                attributeIdentifier: "a2",
                            },
                        },
                    ],
                },
            },
        }),
    );
    set((s) =>
        withReport(s, {
            lastSavedObject: {
                ...s.report.lastSavedObject,
                visualizationObject: {
                    ...s.report.lastSavedObject?.visualizationObject,
                    content: {
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: [
                                    {
                                        measure: {
                                            localIdentifier: "m1",
                                            definition: {
                                                measureDefinition: {
                                                    item: {
                                                        uri: "/gdc/md/1",
                                                    },
                                                },
                                            },
                                            title: "m1",
                                        },
                                    },
                                ],
                            },
                            {
                                localIdentifier: "attributes",
                                items: [
                                    {
                                        visualizationAttribute: {
                                            localIdentifier: "a1",
                                            displayForm: {
                                                uri: "/gdc/md/2",
                                            },
                                        },
                                    },
                                    {
                                        visualizationAttribute: {
                                            localIdentifier: "a2",
                                            displayForm: {
                                                uri: "/gdc/md/3",
                                            },
                                        },
                                    },
                                ],
                                totals: [
                                    {
                                        attributeIdentifier: "a2",
                                        measureIdentifier: "m1",
                                        type: "sum",
                                    },
                                ],
                            },
                        ],
                        visualizationClass: {
                            uri: LOCAL_TABLE,
                        },
                        properties: JSON.stringify({
                            sortItems: [
                                {
                                    attributeSortItem: {
                                        attributeIdentifier: "a2",
                                        direction: "asc",
                                    },
                                },
                            ],
                        }),
                    },
                },
            } as never,
        }),
    );
});

const reportMissingMetric = withData(getInitializedState(), {
    visualizationClass: visualizationClassMock(LOCAL_COLUMN, LOCAL_TABLE),
});

const geoChartWithoutLocation = withData(getInitializedState(), {
    visualizationClass: visualizationClassMock(LOCAL_PUSHPIN, "visualizationClassUri"),
});

const savingInProgress = withReport(validReportWithoutChanges, { saving: true });
const savingAsInProgress = withReport(validReportWithoutChanges, { savingAsNew: true });

describe("Save selectors", () => {
    describe("isUsedOnOtherThanSourceDashboard", () => {
        // the result function only reads `allDashboards`, so the cases carry just that
        it.each<[boolean, string, Pick<IInsightUsageOnDashboard, "allDashboards">]>([
            [false, "dashboardId1", { allDashboards: [] }],
            [false, "dashboardId1", { allDashboards: [{ title: "dashboard 1", id: "dashboardId1" }] }],
            [
                true,
                "dashboardId1",
                {
                    allDashboards: [
                        { title: "dashboard 1", id: "dashboardId1" },
                        { title: "dashboard 2", id: "dashboardId2" },
                    ],
                },
            ],
            // source dashboard id is undefined when editing new dashboard that hasn't been saved yet
            [true, "undefined", { allDashboards: [{ title: "dashboard 1", id: "dashboardId1" }] }],
        ])(
            "should return %s when source dashboard id is %s and usages are %s",
            (expectedResult, sourceDashboardId, usages) => {
                expect(
                    isUsedOnOtherThanSourceDashboard.resultFunc(
                        usages as IInsightUsageOnDashboard,
                        sourceDashboardId,
                    ),
                ).toBe(expectedResult);
            },
        );
    });

    describe("saveReportSelector", () => {
        describe("isSaving and isDisabled", () => {
            it("should return isSaving false and isDisabled true when report is not valid and not saving", () => {
                expect(saveReportSelector(getInitializedState())).toMatchObject({
                    isSaving: false,
                    isDisabled: true,
                });
            });

            it("should return isSaving false and isDisabled true when report is valid but same", () => {
                expect(saveReportSelector(validReportWithoutChanges)).toMatchObject({
                    isSaving: false,
                    isDisabled: true,
                });
            });

            it("should return isSaving false and isDisabled false when report is valid and different", () => {
                expect(saveReportSelector(validReportWithChanges)).toMatchObject({
                    isSaving: false,
                    isDisabled: false,
                });
            });

            it("should return isDisabled=false when report the same and title changed", () => {
                expect(saveReportSelector(reportWithChangedTitle)).toMatchObject({
                    isSaving: false,
                    isDisabled: false,
                });
            });

            it("should be disabled and saving when report is saving", () => {
                expect(saveReportSelector(savingInProgress)).toMatchObject({
                    isSaving: true,
                    isDisabled: true,
                });
            });

            it("save should be enabled if tooLarge", () => {
                expect(saveReportSelector(reportTooLarge)).toMatchObject({
                    isSaving: false,
                    isDisabled: false,
                });
            });

            it("save should be enabled if empty", () => {
                expect(saveReportSelector(reportEmpty)).toMatchObject({
                    isSaving: false,
                    isDisabled: false,
                });
            });

            it("save should be enabled if protected report with changes", () => {
                expect(saveReportSelector(protectedReportWithChanges)).toMatchObject({
                    isSaving: false,
                    isDisabled: false,
                });
            });

            it('should be disabled and not saving when "save as" is in progress', () => {
                expect(saveReportSelector(savingAsInProgress)).toMatchObject({
                    isSaving: false,
                    isDisabled: true,
                });
            });

            it("should be disabled if report is missing metric and vis. type is table", () => {
                expect(saveReportSelector(reportMissingMetric)).toMatchObject({
                    isSaving: false,
                    isDisabled: true,
                });
            });

            it("should Save button be disable if Geo chart is missing Location attribute", () => {
                expect(saveReportSelector(geoChartWithoutLocation)).toMatchObject({
                    isSaving: false,
                    isDisabled: true,
                });
            });
        });
    });

    describe("saveAsNewReportSelector", () => {
        it("should return isSaving false and isDisabled true when report is not valid and not saving", () => {
            expect(saveAsNewReportSelector(getInitializedState())).toEqual({
                isSaving: false,
                isDisabled: true,
            });
        });

        it("should return isSaving false and isDisabled false when report is valid but same", () => {
            expect(saveAsNewReportSelector(validReportWithoutChanges)).toEqual({
                isSaving: false,
                isDisabled: false,
            });
        });

        it("should return isSaving false and isDisabled false when report is valid and different", () => {
            expect(saveAsNewReportSelector(validReportWithChanges)).toEqual({
                isSaving: false,
                isDisabled: false,
            });
        });

        it("should return isDisabled=false when report the same and title changed", () => {
            expect(saveAsNewReportSelector(reportWithChangedTitle)).toEqual({
                isSaving: false,
                isDisabled: false,
            });
        });

        it('should be disabled and saving when report "saving as" is in progress', () => {
            expect(saveAsNewReportSelector(savingAsInProgress)).toEqual({
                isSaving: true,
                isDisabled: true,
            });
        });

        it('should be disabled and not saving when "save" is in progress', () => {
            expect(saveAsNewReportSelector(savingInProgress)).toEqual({
                isSaving: false,
                isDisabled: true,
            });
        });

        it('"save as" should be enabled if tooLarge', () => {
            expect(saveAsNewReportSelector(reportTooLarge)).toEqual({
                isSaving: false,
                isDisabled: false,
            });
        });

        it('"save" should be disabled even though metric generated title is different (e.g. localized)', () => {
            const metricUri = "/gdc/md/1";
            const title = "Amount";
            const localizedTitle = "Amount Localized";

            const withDifferentMeasureTitle = withData(
                withData(
                    withReport(validReportWithoutChanges, {
                        lastSavedObject: withMdObjectContent(
                            validReportWithoutChanges.report.lastSavedObject,
                            {
                                buckets: [
                                    {
                                        localIdentifier: "measures",
                                        items: [
                                            {
                                                measure: {
                                                    definition: {
                                                        measureDefinition: {
                                                            item: { uri: metricUri },
                                                        },
                                                    },
                                                    localIdentifier: "m1",
                                                    title: localizedTitle,
                                                },
                                            },
                                        ],
                                    },
                                ],
                                visualizationClass: { uri: LOCAL_TABLE },
                                properties: "{}",
                            },
                        ),
                    }),
                    {
                        itemCache: {
                            [`metric.${metricUri}`]: {
                                type: "metric",
                                title,
                                uri: metricUri,
                                ref: {
                                    uri: metricUri,
                                },
                            },
                        },
                    },
                ),
                {
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    type: "metric",
                                    attribute: metricUri,
                                    localIdentifier: "m1",
                                },
                            ],
                        },
                    ],
                },
            );

            expect(saveReportSelector(withDifferentMeasureTitle)).toMatchObject({
                isSaving: false,
                isDisabled: true,
            });
        });

        it('"save should" be enabled if empty', () => {
            expect(saveAsNewReportSelector(reportEmpty)).toEqual({
                isSaving: false,
                isDisabled: false,
            });
        });

        it("should be disabled if metric is missing", () => {
            expect(saveAsNewReportSelector(reportMissingMetric)).toEqual({
                isSaving: false,
                isDisabled: true,
            });
        });
    });

    describe("prepareForComparison", () => {
        it("should return null for falsy input", () => {
            expect(prepareForComparison(undefined)).toBeNull();
        });

        it("should return reordered buckets by name", () => {
            expect(prepareForComparison(bucketsOrder1Report)).toMatchSnapshot();
        });

        it("should convert boolean values to real values", () => {
            expect(prepareForComparison(booleanValuesReport)).toMatchSnapshot();
        });

        it("should delete title for comparison", () => {
            expect(prepareForComparison(titleReport)).toMatchSnapshot();
        });

        it("should expand properties for comparison", () => {
            expect(prepareForComparison(propertiesReport)).toMatchSnapshot();
        });

        it("should delete condition property for measure value filters set to all", () => {
            expect(prepareForComparison(measureValueFilterReport)).toMatchSnapshot();
        });
    });

    describe("isSavedReportCurrentReport", () => {
        describe("empty date values mode", () => {
            const dataSet = closedDateDataset.ref;
            // the legacy shape: All time plus the single "" attribute filter on a date attribute
            const legacyContent: IReportContent = {
                visualizationClass: { uri: LOCAL_TABLE },
                buckets: [],
                filters: [
                    { relativeDateFilter: { dataSet, granularity: "GDC.time.year" } },
                    {
                        negativeAttributeFilter: {
                            displayForm: closedDateDataset.attributes![0].dfRef!,
                            notIn: [""],
                        },
                    },
                ],
            };
            const openedWith = (content: IReportContent, mode: "exclude" | "only") => {
                const withDateDatasets = withData(validReportWithoutChanges, {
                    dateDatasets: {
                        ...validReportWithoutChanges.data.dateDatasets,
                        available: [closedDateDataset],
                    },
                    filterBar: {
                        ...validReportWithoutChanges.data.filterBar,
                        items: [
                            {
                                type: "date",
                                localIdentifier: "date",
                                cacheItemIdentifier: "date",
                                overTimeComparisonType: "nothing",
                                dateDatasetRef: dataSet,
                                emptyDateValuesFilter: mode,
                            },
                        ],
                    },
                });
                return withReport(
                    withRoot(withDateDatasets, { featureFlags: { enableImprovedMetricDateFilter: true } }),
                    {
                        lastSavedObject: {
                            visualizationObject: {
                                ...validReportWithoutChanges.report.lastSavedObject.visualizationObject,
                                content,
                            },
                        },
                    },
                );
            };

            it("treats an insight stored in the legacy shape and opened without edits as saved", () => {
                expect(isSavedReportCurrentReport(openedWith(legacyContent, "exclude"))).toBe(true);
            });

            it("still sees a changed mode", () => {
                expect(isSavedReportCurrentReport(openedWith(legacyContent, "only"))).toBe(false);
            });
        });

        it.each([
            {
                ref: idRef("missing_metric"),
                aggregation: undefined,
                expectedRef: idRef("missing_metric", "measure"),
            },
            { ref: idRef("missing_fact"), aggregation: "sum", expectedRef: idRef("missing_fact", "fact") },
            {
                ref: idRef("missing_attribute"),
                aggregation: "count",
                expectedRef: idRef("missing_attribute", "attribute"),
            },
            {
                ref: uriRef("/gdc/md/project/obj/missing_metric"),
                aggregation: undefined,
                expectedRef: uriRef("/gdc/md/project/obj/missing_metric"),
            },
        ] as const)(
            "preserves a saved measure absent from the catalog ($ref)",
            ({ ref, aggregation, expectedRef }) => {
                const content: IReportContent = {
                    visualizationClass: { uri: LOCAL_TABLE },
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "m1",
                                        format: "#,##0",
                                        definition: {
                                            measureDefinition: {
                                                item: ref,
                                                ...(aggregation ? { aggregation } : {}),
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    filters: [],
                };
                const { buckets } = metadataToBuckets({
                    metadataObject: content,
                    additionalData: {
                        itemCache: {},
                        filterItems: {},
                        dateDatasets: { available: [], unavailable: 0 },
                        properties: {},
                    },
                });
                const state = withReport(withData(validReportWithoutChanges, { buckets, itemCache: {} }), {
                    lastSavedObject: {
                        visualizationObject: {
                            ...validReportWithoutChanges.report.lastSavedObject.visualizationObject,
                            content,
                        },
                    },
                });

                expect(isSavedReportCurrentReport(state)).toBe(true);
                expect(getInsightForSaveViaMd(state).insight.buckets).toMatchObject([
                    { items: [{ measure: { definition: { measureDefinition: { item: expectedRef } } } }] },
                ]);
                expect(
                    getVisualizationObjectForSave(state).visualizationObject.content.buckets,
                ).toMatchObject(content.buckets);
            },
        );

        describe.each(["count", "approximate_count"] as const)(
            "%s over a computed attribute",
            (aggregation) => {
                it.each([
                    { catalog: "empty", itemCache: {} },
                    {
                        catalog: "regular attribute with the same ID",
                        itemCache: {
                            "attribute.rep_performance": catalogEntries["attribute.rep_performance"],
                        },
                    },
                    {
                        catalog: "both attributes with the same ID",
                        itemCache: {
                            "attribute.rep_performance": catalogEntries["attribute.rep_performance"],
                            "computedAttribute.rep_performance":
                                catalogEntries["computedAttribute.rep_performance"],
                        },
                    },
                ])("preserves the reference when the catalog contains $catalog", ({ itemCache }) => {
                    const ref = idRef("rep_performance", "computedAttribute");
                    const insight: IInsight = {
                        insight: {
                            identifier: "computed-count",
                            uri: "/visualizationObjects/computed-count",
                            ref: idRef("computed-count", "insight"),
                            title: "Count of Rep Performance",
                            visualizationUrl: LOCAL_TABLE,
                            buckets: [
                                {
                                    localIdentifier: "measures",
                                    items: [
                                        {
                                            measure: {
                                                localIdentifier: "m1",
                                                definition: {
                                                    measureDefinition: { item: ref, aggregation },
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                            filters: [],
                            sorts: [],
                            properties: {},
                        },
                    };
                    // Follow the open-report conversion, where identifier types can be lost.
                    const visualizationObject = convertModelInsightToADRep(insight, true);
                    const { buckets } = metadataToBuckets({
                        metadataObject: visualizationObject.content,
                        additionalData: {
                            itemCache,
                            filterItems: {},
                            dateDatasets: { available: [], unavailable: 0 },
                            properties: {},
                        },
                    });
                    const state = withReport(withData(validReportWithoutChanges, { buckets, itemCache }), {
                        lastSavedObject: { visualizationObject },
                    });

                    expect(getInsightForSaveViaMd(state).insight.buckets).toMatchObject(
                        insight.insight.buckets,
                    );
                    expect(getInsightWithBucketsViaMd(state).insight.buckets).toMatchObject(
                        insight.insight.buckets,
                    );
                    expect(isSavedReportCurrentReport(state)).toBe(true);
                });
            },
        );

        describe("saving subtotals with sorting on other than first attribute", () => {
            it("preserves subtotals in the insight prepared for saving", () => {
                const insight = getInsightForSaveViaMd(reportWithSubtotalsAndSort);

                expect(
                    insight.insight.buckets.find((bucket) => bucket.localIdentifier === "attributes")?.totals,
                ).toEqual([{ attributeIdentifier: "a2", measureIdentifier: "m1", type: "sum" }]);
            });

            it("detects removing a saved subtotal as an unsaved change", () => {
                const state = withData(reportWithSubtotalsAndSort, {
                    buckets: reportWithSubtotalsAndSort.data.buckets.map((bucket) => ({
                        ...bucket,
                        totals: [] as ITotal[],
                    })),
                });

                expect(isSavedReportCurrentReport(state)).toBe(false);
            });

            it("detects adding a subtotal to a saved report as an unsaved change", () => {
                const savedReport = reportWithSubtotalsAndSort.report.lastSavedObject;
                const content = savedReport.visualizationObject!.content!;
                const state = withReport(reportWithSubtotalsAndSort, {
                    lastSavedObject: withMdObjectContent(savedReport, {
                        ...content,
                        buckets: content.buckets.map((bucket) => ({ ...bucket, totals: [] as ITotal[] })),
                    }),
                });

                expect(isSavedReportCurrentReport(state)).toBe(false);
            });

            it("should return false if current report is different", () => {
                const state = withData(reportWithSubtotalsAndSort, {
                    buckets: withBucketItems(reportWithSubtotalsAndSort.data.buckets, 0, []),
                });

                const isSame = isSavedReportCurrentReport(state);

                expect(isSame).toEqual(false);
            });

            it("should return true if current report is same", () => {
                const isSame = isSavedReportCurrentReport(reportWithSubtotalsAndSort);

                expect(isSame).toEqual(true);
            });
        });
    });
});
