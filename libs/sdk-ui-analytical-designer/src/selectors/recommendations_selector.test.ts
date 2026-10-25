// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IVisualizationClassBody } from "@gooddata/sdk-model";
import { ErrorCodes } from "@gooddata/sdk-ui";

import { FILTERS, MEASURES, VIEW } from "../constants/bucket.js";
import { LOCAL_BAR, LOCAL_COLUMN, LOCAL_PUSHPIN } from "../constants/visualization_types.js";
import { DATE_DATASET_ATTRIBUTE, DATE_TYPE } from "../models/date_item.js";
import { dateDatasetsInitialState } from "../store/date_datasets/date_datasets_state.js";
import { type IFilterBarState } from "../store/filter_bar/filter_bar_state.js";
import { type IDateFilterConfig, type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import { withBucketItem, withBucketItems, withoutBucket } from "../tests/buckets_builder.test.helpers.js";
import { dateCreated } from "../tests/constants.test.helpers.js";
import { withRecommendationsUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { withExecutionError } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import {
    withAppState,
    withData,
    withReport,
    withRoot,
    withShortcut,
} from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import { type IDateDataset } from "../typings/datasets.js";

import {
    displayRecommendationBlockSelector,
    displayRecommendationComparisonWithPeriodSelector,
    displayRecommendationContributionInPercentsSelector,
    displayRecommendationFilteringSelector,
    displayRecommendationsMetricWithPeriodSelector,
    displayRecommendationsTrendingSelector,
    isRecommendationDismissedForVisClass,
} from "./recommendations_selector.js";

describe("Recommendations selector test", () => {
    let state: IAppState;

    beforeEach(() => {
        const pristine = getInitializedState();
        // ONE typed literal. This was a 10-deep tower of generic deep-path writes over root path
        // constants, and with the root type closed the branch values can just be written out.
        state = {
            ...pristine,
            appState: {
                ...pristine.appState,
                bootstrapData: { project: { id: "my project" } },
            } as never,
            data: {
                ...pristine.data,
                visualizationClass: visualizationClassMock(LOCAL_COLUMN, "visualizationClassUri"),
                filters: {
                    localIdentifier: FILTERS,
                    items: [
                        {
                            attribute: DATE_DATASET_ATTRIBUTE,
                            filters: [{ interval: { name: "NOT_ALL_TIME" } }],
                        },
                    ],
                },
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [{ attribute: "test", showInPercent: false, filters: [] }],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [
                            {
                                attribute: DATE_DATASET_ATTRIBUTE,
                                filters: [],
                                dateDatasetRef: { uri: "uri" },
                            },
                        ],
                    },
                ],
                dateDatasets: {
                    ...dateDatasetsInitialState,
                    available: [{ item: "test", attributes: [], title: "" }],
                    unavailable: 0,
                },
                itemCache: { test: { type: "attribute" } },
                filterBar: {
                    ...pristine.data.filterBar,
                    items: [
                        {
                            type: DATE_TYPE,
                            filterConfig: [{ interval: { name: "NOT_ALL_TIME" } }],
                            dateDatasetRef: { uri: "uri" },
                        },
                    ],
                },
            } as never,
            report: {
                ...pristine.report,
                execution: { ...pristine.report.execution, hasData: true },
            },
        };
        // the selected class is overwritten last, exactly as the original chain did
        state = withData(state, {
            visualizationClass: { visualizationClass: { url: "local:pie" } as IVisualizationClassBody },
        });
    });

    describe("displayRecommendationComparisonWithPeriodSelector", () => {
        it("should return contribution in percent visible flag set to true", () => {
            state = withData(
                withData(state, {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        previousPeriod: true,
                    }),
                }),
                {
                    buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                },
            );

            const shouldShow = displayRecommendationComparisonWithPeriodSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return contribution in percent visible flag set to false", () => {
            state = withData(
                withData(
                    withData(state, {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { previousPeriod: false },
                        ),
                    }),
                    {
                        buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                    },
                ),
                {
                    buckets: withBucketItem(
                        withData(
                            withData(state, {
                                extendedReferencePoint: withRecommendationsUiConfig(
                                    state.data.extendedReferencePoint,
                                    { previousPeriod: false },
                                ),
                            }),
                            {
                                buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                            },
                        ).data.buckets,
                        0,
                        0,
                        { showInPercent: true },
                    ),
                },
            );

            const shouldShow = displayRecommendationComparisonWithPeriodSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return false if there is date dataset error", () => {
            state = withShortcut(
                withData(
                    withData(state, {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { previousPeriod: true },
                        ),
                    }),
                    {
                        buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                    },
                ),
                {
                    shortcutDateDatasets: {
                        ...state.data.shortcut.shortcutDateDatasets,
                        // only `message` — the readers just test for PRESENCE of an error
                        error: { message: "error" } as Error,
                    },
                },
            );

            const shouldShow = displayRecommendationComparisonWithPeriodSelector(state);
            expect(shouldShow).toEqual(false);
        });
    });

    describe("displayRecommendationContributionInPercentsSelector", () => {
        it("should return contribution in percent visible flag set to true", () => {
            state = withData(
                withData(state, {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        percent: true,
                    }),
                }),
                {
                    buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                },
            );

            const shouldShow = displayRecommendationContributionInPercentsSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return contribution in percent visible flag set to false", () => {
            state = withData(
                withData(
                    withData(state, {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { percent: false },
                        ),
                    }),
                    {
                        buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                    },
                ),
                {
                    buckets: withBucketItem(
                        withData(
                            withData(state, {
                                extendedReferencePoint: withRecommendationsUiConfig(
                                    state.data.extendedReferencePoint,
                                    { percent: false },
                                ),
                            }),
                            {
                                buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                            },
                        ).data.buckets,
                        0,
                        0,
                        { showInPercent: true },
                    ),
                },
            );

            const shouldShow = displayRecommendationContributionInPercentsSelector(state);
            expect(shouldShow).toEqual(false);
        });
    });

    describe("displayRecommendationsMetricWithPeriodSelector", () => {
        it("should return comparsion with period visible flag set to true", () => {
            state = withData(state, {
                extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                    overTimeComparison: true,
                }),
            });
            const shouldShow = displayRecommendationsMetricWithPeriodSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return comparsion with period visible flag set to false", () => {
            state = withData(state, {
                extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                    overTimeComparison: false,
                }),
            });

            const shouldShow = displayRecommendationsMetricWithPeriodSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return comparsion with period visible flag set to false because date dimension are not same (in buckets and date filter)", () => {
            state = withData(
                withData(state, {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        overTimeComparison: true,
                    }),
                }),
                {
                    filterBar: {
                        items: [
                            {
                                type: DATE_TYPE,
                                filterConfig: [
                                    { interval: { name: "NOT_ALL_TIME" } },
                                ] as unknown as IDateFilterConfig,
                                dateDatasetRef: { uri: "not.same.uri" },
                            } as unknown as IFilter,
                        ],
                    } as unknown as IFilterBarState,
                },
            );

            const shouldShow = displayRecommendationsMetricWithPeriodSelector(state);
            expect(shouldShow).toEqual(false);
        });
    });

    describe("displayRecommendationsTrendingSelector", () => {
        it("should return trending visible flag set to true", () => {
            state = withData(
                withData(
                    withData(state, {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { trending: true },
                        ),
                    }),
                    {
                        buckets: withoutBucket(state.data.buckets, 1),
                    },
                ),
                {
                    dateDatasets: {
                        ...dateDatasetsInitialState,
                        available: [{ title: "test" }] as IDateDataset[],
                    },
                },
            );

            const shouldShow = displayRecommendationsTrendingSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return trending visible flag set to false", () => {
            state = withData(state, {
                extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                    trending: false,
                }),
            });

            const shouldShow = displayRecommendationsTrendingSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return false if there is date dataset error", () => {
            state = withShortcut(
                withData(
                    withData(
                        withData(state, {
                            extendedReferencePoint: withRecommendationsUiConfig(
                                state.data.extendedReferencePoint,
                                { trending: true },
                            ),
                        }),
                        {
                            buckets: withoutBucket(state.data.buckets, 1),
                        },
                    ),
                    {
                        dateDatasets: {
                            ...dateDatasetsInitialState,
                            available: [{ title: "test" }] as IDateDataset[],
                        },
                    },
                ),
                {
                    shortcutDateDatasets: {
                        ...state.data.shortcut.shortcutDateDatasets,
                        // only `message` — the readers just test for PRESENCE of an error
                        error: { message: "error" } as Error,
                    },
                },
            );

            const shouldShow = displayRecommendationsTrendingSelector(state);
            expect(shouldShow).toEqual(false);
        });
    });

    describe("isRecommendationDismissedForVisClass", () => {
        it("should return dismissed flag set to false", () => {
            state = withAppState(state, { dismissedRecommendations: [] });

            const shouldShow = isRecommendationDismissedForVisClass(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return dismissed flag set to false when other visualization is used than dismissed", () => {
            state = withAppState(state, { dismissedRecommendations: ["donut"] });

            const shouldShow = isRecommendationDismissedForVisClass(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return dismissed flag set to true", () => {
            state = withAppState(state, { dismissedRecommendations: ["pie"] });

            const shouldShow = isRecommendationDismissedForVisClass(state);
            expect(shouldShow).toEqual(true);
        });
    });

    describe("displayRecommendationsFilteringSelector", () => {
        it("should return filtering visible flag set to false", () => {
            state = withData(
                withData(state, {
                    propertiesMeta: { ...state.data.propertiesMeta, isFilteringRecommended: false },
                }),
                {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        supportsFilteringRecommendation: true,
                    }),
                },
            );

            const shouldShow = displayRecommendationFilteringSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return filtering visible flag set to false when not supported", () => {
            state = withData(
                withData(state, {
                    propertiesMeta: { ...state.data.propertiesMeta, isFilteringRecommended: true },
                }),
                {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        supportsFilteringRecommendation: false,
                    }),
                },
            );

            const shouldShow = displayRecommendationFilteringSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return filtering visible flag set to true", () => {
            state = withData(
                withData(state, {
                    propertiesMeta: { ...state.data.propertiesMeta, isFilteringRecommended: true },
                }),
                {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        supportsFilteringRecommendation: true,
                    }),
                },
            );

            const shouldShow = displayRecommendationFilteringSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return filtering visible flag set to false for geo segment conflict when FF is disabled", () => {
            state = withRoot(
                withData(
                    withData(
                        withData(state, {
                            propertiesMeta: { ...state.data.propertiesMeta, isFilteringRecommended: false },
                        }),
                        {
                            propertiesMeta: {
                                ...withData(state, {
                                    propertiesMeta: {
                                        ...state.data.propertiesMeta,
                                        isFilteringRecommended: false,
                                    },
                                }).data.propertiesMeta,
                                isGeoSegmentConflictRecommended: true,
                            },
                        },
                    ),
                    {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { supportsFilteringRecommendation: true },
                        ),
                    },
                ),
                { featureFlags: { enableGeoSegmentConflictRecommendation: false } },
            );

            const shouldShow = displayRecommendationFilteringSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return filtering visible flag set to true for geo segment conflict when FF is enabled", () => {
            state = withRoot(
                withData(
                    withData(
                        withData(
                            withData(state, {
                                propertiesMeta: {
                                    ...state.data.propertiesMeta,
                                    isFilteringRecommended: false,
                                },
                            }),
                            {
                                propertiesMeta: {
                                    ...withData(state, {
                                        propertiesMeta: {
                                            ...state.data.propertiesMeta,
                                            isFilteringRecommended: false,
                                        },
                                    }).data.propertiesMeta,
                                    isGeoSegmentConflictRecommended: true,
                                },
                            },
                        ),
                        {
                            visualizationClass: {
                                visualizationClass: {
                                    url: LOCAL_PUSHPIN,
                                } as unknown as IVisualizationClassBody,
                            },
                        },
                    ),
                    {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { supportsFilteringRecommendation: true },
                        ),
                    },
                ),
                { featureFlags: { enableGeoSegmentConflictRecommendation: true } },
            );

            const shouldShow = displayRecommendationFilteringSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return filtering visible flag set to false for geo segment conflict on non-geo visualizations", () => {
            state = withRoot(
                withData(
                    withData(
                        withData(
                            withData(state, {
                                propertiesMeta: {
                                    ...state.data.propertiesMeta,
                                    isFilteringRecommended: false,
                                },
                            }),
                            {
                                propertiesMeta: {
                                    ...withData(state, {
                                        propertiesMeta: {
                                            ...state.data.propertiesMeta,
                                            isFilteringRecommended: false,
                                        },
                                    }).data.propertiesMeta,
                                    isGeoSegmentConflictRecommended: true,
                                },
                            },
                        ),
                        {
                            visualizationClass: {
                                visualizationClass: {
                                    url: LOCAL_BAR,
                                } as unknown as IVisualizationClassBody,
                            },
                        },
                    ),
                    {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { supportsFilteringRecommendation: true },
                        ),
                    },
                ),
                { featureFlags: { enableGeoSegmentConflictRecommendation: true } },
            );

            const shouldShow = displayRecommendationFilteringSelector(state);
            expect(shouldShow).toEqual(false);
        });
    });

    describe("displayRecommendationBlockSelector", () => {
        it("should return visible flag set to true", () => {
            state = withData(state, {
                extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                    previousPeriod: true,
                }),
            });

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return visible flag set to true if displayRecommendationContributionInPercentsSelector pass", () => {
            state = withData(
                withData(state, {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        percent: true,
                    }),
                }),
                {
                    buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                },
            );

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return visible flag set to true if displayRecommendationsMetricWithPeriodSelector pass", () => {
            state = withData(state, {
                extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                    overTimeComparison: true,
                }),
            });

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return visible flag set to true if displayRecommendationComparisonWithPeriodSelector pass", () => {
            state = withData(
                withData(state, {
                    extendedReferencePoint: withRecommendationsUiConfig(state.data.extendedReferencePoint, {
                        previousPeriod: true,
                    }),
                }),
                {
                    buckets: withBucketItem(state.data.buckets, 1, 0, { attribute: "test" }),
                },
            );

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return visible flag set to true if displayRecommendationsTrendingSelector pass", () => {
            state = withData(
                withData(withData(state, { buckets: withBucketItems(state.data.buckets, 1, []) }), {
                    extendedReferencePoint: withRecommendationsUiConfig(
                        withData(state, { buckets: withBucketItems(state.data.buckets, 1, []) }).data
                            .extendedReferencePoint,
                        { trending: true },
                    ),
                }),
                {
                    dateDatasets: {
                        ...dateDatasetsInitialState,
                        available: [{ ...dateCreated, attributes: [] }],
                    },
                },
            );

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return visible flag set to true if displayRecommendationFilteringSelector pass and recommendation is not dismissed", () => {
            state = withAppState(
                withData(
                    withData(state, {
                        propertiesMeta: { ...state.data.propertiesMeta, isFilteringRecommended: true },
                    }),
                    {
                        extendedReferencePoint: withRecommendationsUiConfig(
                            state.data.extendedReferencePoint,
                            { supportsFilteringRecommendation: true },
                        ),
                    },
                ),
                { dismissedRecommendations: [] },
            );

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(true);
        });

        it("should return visible flag set to false if displayRecommendationFilteringSelector pass and recommendation is dismissed", () => {
            state = withAppState(
                withData(state, {
                    propertiesMeta: { ...state.data.propertiesMeta, isFilteringRecommended: true },
                }),
                { dismissedRecommendations: ["pie"] },
            );

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return visible flag set to false if report execution status is BAD_REQUEST", () => {
            state = withReport(state, {
                execution: withExecutionError(state.report.execution, { status: ErrorCodes.BAD_REQUEST }),
            });

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return visible flag set to false if report execution status is UNKNOWN_ERROR", () => {
            state = withReport(state, {
                execution: withExecutionError(state.report.execution, { status: ErrorCodes.UNKNOWN_ERROR }),
            });

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return visible flag set to false when report is too large", () => {
            state = withReport(state, {
                execution: withExecutionError(state.report.execution, {
                    status: ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
                }),
            });

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(false);
        });

        it("should return visible flag set to false when report is empty", () => {
            state = withReport(state, {
                execution: withExecutionError(state.report.execution, { status: ErrorCodes.NO_DATA }),
            });

            const shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).toEqual(false);
        });
    });
});
