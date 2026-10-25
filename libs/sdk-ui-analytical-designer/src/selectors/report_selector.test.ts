// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IVisualizationClassBody } from "@gooddata/sdk-model";
import { ErrorCodes, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { PluggableVisualizationErrorCodes } from "@gooddata/sdk-ui-ext/internal";

import { MEASURES, METRIC } from "../constants/bucket.js";
import { NOT_FOUND } from "../constants/errors.js";
import {
    LOCAL_CHOROPLETH,
    LOCAL_COLUMN,
    LOCAL_PUSHPIN,
    LOCAL_TABLE,
} from "../constants/visualization_types.js";
import { buildBucketItem } from "../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { GRANULARITY, type Granularity } from "../models/granularity.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { startDragCatalogItem } from "../sagas/drag_and_drop/drag_and_drop_actions.js";
import { updateBucketItemsAt } from "../store/buckets/bucket_item_address.js";
import { FilterBarService, setFilterBarState } from "../store/filter_bar/filter_bar_service.js";
import { defaultFilterBarState } from "../store/filter_bar/filter_bar_state.js";
import { type IDateFilterConfig } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import { buildBucketItemMock } from "../tests/bucket_item.test.helpers.js";
import { withBucketItems, withReplacedBucket } from "../tests/buckets_builder.test.helpers.js";
import {
    columnVisualizationClass,
    setupAppStateWithDateDatasetMeta,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";
import { buildDateFilterMock, filterItems } from "../tests/filter.test.helpers.js";
import { withExecutionError } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withReport } from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import { type IVisualizationObjectContent } from "../typings/bear/bearTypes.js";
import { type IRawBucketItem, type IRawBucketItems } from "../typings/buckets.js";
import { type IErrorResponseData } from "../typings/report.js";

import {
    getExecutionErrorResponseData,
    hasDataSelector,
    hasNegativeValueSelector,
    isDataTooLargeToComputeSelector,
    isDataTooLargeToDisplaySelector,
    isInvalidConfigurationSelector,
    isProtectedReportSelector,
    isReportEmptySelector,
    isReportExecutableSelector,
    isReportMissingAreaSelector,
    isReportMissingLocationSelector,
    isReportMissingMetricSelector,
    isReportNotFoundSelector,
    isReportTooLargeSelector,
    isReportValid,
    isReportWithFiltersEmptySelector,
    isReportWithoutFiltersEmptySelector,
    isUnsupportedConfiguration,
    reportSelector,
} from "./report_selector.js";

describe("reportSelector", () => {
    let state: IAppState;

    function getPreparedState() {
        const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
        return withData(
            withData(
                withData(stateWithDateDatasetMeta, {
                    buckets: [
                        { localIdentifier: "measures", items: [] },
                        { localIdentifier: "view", items: [] },
                        { localIdentifier: "stack", items: [] },
                    ],
                }),
                { visualizationClasses: [columnVisualizationClass, tableVisualizationClass] },
            ),
            { visualizationClass: columnVisualizationClass },
        );
    }

    beforeEach(() => {
        state = getPreparedState();
    });

    describe("getExecutionErrorResponseData", () => {
        it("should return error response data as a object", () => {
            const responseData = {
                traceId: "trace_id",
                message: "error message",
                detail: "error detail",
            };
            state = withReport(state, {
                execution: {
                    ...state.report.execution,
                    error: {
                        status: ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
                        // a PARTIAL error response — the reader only echoes it back
                        responseData: responseData as unknown as IErrorResponseData,
                    },
                },
            });

            expect(getExecutionErrorResponseData(state)).toEqual(responseData);
        });

        it("should return empty object by default", () => {
            expect(getExecutionErrorResponseData(getInitializedState())).toEqual({});
        });
    });

    describe("isReportTooLargeSelector", () => {
        it("should return false by default", () => {
            expect(isReportTooLargeSelector(getInitializedState())).toEqual(false);
        });
    });

    describe("isDataTooLargeToComputeSelector", () => {
        it("should return true if there is DATA_TOO_LARGE_TO_COMPUTE", () => {
            state = withReport(state, {
                execution: {
                    ...state.report.execution,
                    error: {
                        status: ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
                    },
                },
            });

            expect(isDataTooLargeToComputeSelector(state)).toEqual(true);
        });
    });

    describe("isReportMissingLocationSelector", () => {
        it("should return true if location is missing for pushpin", () => {
            const stateWithError = withData(
                withReport(state, {
                    execution: {
                        ...state.report.execution,
                        error: {
                            status: ErrorCodes.GEO_LOCATION_MISSING,
                        },
                    },
                }),
                {
                    visualizationClass: {
                        visualizationClass: { url: LOCAL_PUSHPIN } as unknown as IVisualizationClassBody,
                    },
                },
            );

            expect(isReportMissingLocationSelector(stateWithError)).toEqual(true);
        });
    });

    describe("isReportMissingAreaSelector", () => {
        it("should return true if area is missing for choropleth", () => {
            const stateWithError = withData(
                withReport(state, {
                    execution: {
                        ...state.report.execution,
                        error: {
                            status: ErrorCodes.GEO_AREA_MISSING,
                        },
                    },
                }),
                {
                    visualizationClass: {
                        visualizationClass: { url: LOCAL_CHOROPLETH } as unknown as IVisualizationClassBody,
                    },
                },
            );

            expect(isReportMissingAreaSelector(stateWithError)).toEqual(true);
        });
    });

    describe("isReportMissingMetricSelector", () => {
        it("should return false if there is no data", () => {
            expect(isReportMissingMetricSelector(getInitializedState())).toEqual(false);
        });

        it("should return false for table with data", () => {
            state = withReport(
                withData(state, {
                    visualizationClass: {
                        visualizationClass: {
                            ...state.data.visualizationClass,
                            url: LOCAL_TABLE,
                        } as unknown as IVisualizationClassBody,
                    },
                }),
                {
                    execution: {
                        ...withData(state, {
                            visualizationClass: {
                                visualizationClass: {
                                    ...state.data.visualizationClass,
                                    url: LOCAL_TABLE,
                                } as unknown as IVisualizationClassBody,
                            },
                        }).report.execution,
                        hasData: true,
                    },
                },
            );
            expect(isReportMissingMetricSelector(state)).toEqual(false);
        });

        it("should return false for chart with data & one metric", () => {
            const metricItem = ["foo", "bar"];
            state = withData(
                withData(state, {
                    visualizationClass: {
                        visualizationClass: {
                            ...state.data.visualizationClass,
                            url: LOCAL_COLUMN,
                        } as unknown as IVisualizationClassBody,
                    },
                }),
                {
                    // PRE-EXISTING: the fixture stores ONE item where the bucket holds a
                    // collection. Preserved verbatim — the generic deep setter used to hide it.
                    buckets: withBucketItems(state.data.buckets, 0, metricItem as unknown as IRawBucketItems),
                },
            );
            expect(isReportMissingMetricSelector(state)).toEqual(false);
        });

        it("should return true for chart with data & one attribute", () => {
            const executionError = { status: PluggableVisualizationErrorCodes.INVALID_BUCKETS };
            state = withReport(state, {
                execution: { ...state.report.execution, error: executionError },
            });

            expect(isReportMissingMetricSelector(state)).toEqual(true);
        });
    });

    describe("isReportNotFoundSelector", () => {
        it("should return true if data is too large to display", () => {
            state = withReport(state, {
                execution: { ...state.report.execution, error: { status: NOT_FOUND } },
            });

            expect(isReportNotFoundSelector(state)).toEqual(true);
        });

        it("should return false if shortcuts are rendered (for example by dragging metric)", () => {
            const startDragCatalogItemAction = startDragCatalogItem(buildBucketItem({ type: METRIC }));
            state = withReport(rootReducer(state, startDragCatalogItemAction), {
                execution: {
                    ...rootReducer(state, startDragCatalogItemAction).report.execution,
                    error: {
                        status: NOT_FOUND,
                    },
                },
            });
            expect(isReportNotFoundSelector(state)).toEqual(false);
        });
    });

    describe("isDataTooLargeToDisplaySelector", () => {
        it("should return true if data is too large to display", () => {
            state = withReport(state, {
                execution: {
                    ...state.report.execution,
                    error: {
                        status: ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY,
                    },
                },
            });

            expect(isDataTooLargeToDisplaySelector(state)).toEqual(true);
        });
    });

    describe("isProtectedReportSelector", () => {
        it("should return true if report is protected", () => {
            state = withReport(getInitializedState(), {
                execution: {
                    ...getInitializedState().report.execution,
                    error: {
                        status: ErrorCodes.PROTECTED_REPORT,
                    },
                },
            });

            expect(isProtectedReportSelector(state)).toEqual(true);
        });
    });

    describe("hasNegativeValueSelector", () => {
        it("should return true if data has negative values", () => {
            state = withReport(state, {
                execution: { ...state.report.execution, error: { status: ErrorCodes.NEGATIVE_VALUES } },
            });

            expect(hasNegativeValueSelector(state)).toEqual(true);
        });
    });

    describe("isExecutionRunning", () => {
        it("should not be running by default", () => {
            const { isExecutionRunning } = reportSelector(state);
            expect(isExecutionRunning).toEqual(false);
        });

        it("should return is execution running", () => {
            state = withReport(state, { execution: { ...state.report.execution, running: true } });
            expect(reportSelector(state).isExecutionRunning).toEqual(true);
        });
    });

    describe("hasData", () => {
        it("should be false by default", () => {
            expect(hasDataSelector(state)).toEqual(false);
        });

        it('should return "data" object from state', () => {
            state = withReport(state, { execution: { ...state.report.execution, hasData: true } });
            expect(hasDataSelector(state)).toEqual(true);
        });
    });

    describe("isInvalidConfiguration", () => {
        it("should be false when not set", () => {
            expect(isReportTooLargeSelector(getInitializedState())).toEqual(false);
        });

        it("should be true if the error is BAD_REQUEST", () => {
            const updatedState = withReport(getInitializedState(), {
                execution: withExecutionError(getInitializedState().report.execution, {
                    status: ErrorCodes.BAD_REQUEST,
                }),
            });

            expect(isInvalidConfigurationSelector(updatedState)).toEqual(true);
        });

        it("should be true if the error is unknown", () => {
            const updatedState = withReport(getInitializedState(), {
                execution: withExecutionError(getInitializedState().report.execution, {
                    status: ErrorCodes.UNKNOWN_ERROR,
                }),
            });

            expect(isInvalidConfigurationSelector(updatedState)).toEqual(true);
        });
    });

    describe("isReportEmptySelector", () => {
        it("should return true if there is NO_DATA execution error", () => {
            const state = withReport(getInitializedState(), {
                execution: {
                    ...getInitializedState().report.execution,
                    error: {
                        status: ErrorCodes.NO_DATA,
                    },
                },
            });

            expect(isReportEmptySelector(state)).toEqual(true);
        });

        it("should return false if there is not a NO_DATA execution error", () => {
            expect(isReportEmptySelector(getInitializedState())).toEqual(false);
        });
    });

    describe("isReportWithFiltersEmptySelector", () => {
        it("should return true if there is NO_DATA execution error and some filters are applied", () => {
            let state = withReport(getInitializedState(), {
                execution: {
                    ...getInitializedState().report.execution,
                    error: {
                        status: ErrorCodes.NO_DATA,
                    },
                },
            });

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: filterItems,
            });

            expect(isReportWithFiltersEmptySelector(state)).toEqual(true);
        });

        it("should return true if there is NO_DATA execution error and there is a measure having date filter applied", () => {
            const measureWithDateFilter: IRawBucketItem = buildBucketItemMock({
                localIdentifier: "m1",
                type: METRIC,
                filters: [{ attribute: "attr.datedataset" }],
            });

            let state = withData(
                withReport(getInitializedState(), {
                    execution: {
                        ...getInitializedState().report.execution,
                        error: {
                            status: ErrorCodes.NO_DATA,
                        },
                    },
                }),
                {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: [measureWithDateFilter],
                        },
                    ],
                },
            );

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: [],
            });

            expect(isReportWithFiltersEmptySelector(state)).toEqual(true);
        });

        it("should return true if there is NO_DATA execution error and there is a measure having some attribute filters applied", () => {
            const measureWithAttributeFilter: IRawBucketItem = buildBucketItemMock({
                localIdentifier: "m1",
                type: METRIC,
                filters: [
                    {
                        selectedElements: [
                            {
                                uri: "/m1/",
                                title: "Direct Sales",
                            },
                        ],
                    },
                ],
            });

            let state = withData(
                withReport(getInitializedState(), {
                    execution: {
                        ...getInitializedState().report.execution,
                        error: {
                            status: ErrorCodes.NO_DATA,
                        },
                    },
                }),
                {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: [measureWithAttributeFilter],
                        },
                    ],
                },
            );

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: [],
            });

            expect(isReportWithFiltersEmptySelector(state)).toEqual(true);
        });

        it("should return false if there is NO_DATA execution error and there is a measure having some attribute filters, yet none of those applied (ALL)", () => {
            const measureWithAttributeFilter: IRawBucketItem = buildBucketItemMock({
                localIdentifier: "m1",
                type: METRIC,
                filters: [
                    {
                        selectedElements: [],
                    },
                ],
            });

            let state = withData(
                withReport(getInitializedState(), {
                    execution: {
                        ...getInitializedState().report.execution,
                        error: {
                            status: ErrorCodes.NO_DATA,
                        },
                    },
                }),
                {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: [measureWithAttributeFilter],
                        },
                    ],
                },
            );

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: [],
            });

            expect(isReportWithFiltersEmptySelector(state)).toEqual(false);
        });

        it("should return false if there is NO_DATA execution error but no filters are applied", () => {
            let state = withReport(getInitializedState(), {
                execution: {
                    ...getInitializedState().report.execution,
                    error: {
                        status: ErrorCodes.NO_DATA,
                    },
                },
            });

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: [],
            });

            expect(isReportWithFiltersEmptySelector(state)).toEqual(false);
        });
    });

    describe("isReportWithoutFiltersEmptySelector", () => {
        it("should return true if there is NO_DATA execution error and no filters are applied", () => {
            let state = withReport(getInitializedState(), {
                execution: {
                    ...getInitializedState().report.execution,
                    error: {
                        status: ErrorCodes.NO_DATA,
                    },
                },
            });

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: [],
            });

            expect(isReportWithoutFiltersEmptySelector(state)).toEqual(true);
        });

        it("should return false if there is NO_DATA execution error and there no filters set up", () => {
            let state = withReport(getInitializedState(), {
                execution: {
                    ...getInitializedState().report.execution,
                    error: {
                        status: ErrorCodes.NO_DATA,
                    },
                },
            });

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: [filterItems[5]],
            });

            expect(isReportWithoutFiltersEmptySelector(state)).toEqual(true);
        });

        it("should return false if there is NO_DATA execution error but some filters are applied", () => {
            let state = withReport(getInitializedState(), {
                execution: {
                    ...getInitializedState().report.execution,
                    error: {
                        status: ErrorCodes.NO_DATA,
                    },
                },
            });

            state = setFilterBarState(state, {
                ...defaultFilterBarState,
                items: filterItems,
            });

            expect(isReportWithoutFiltersEmptySelector(state)).toEqual(false);
        });
    });

    describe("isReportValid", () => {
        beforeEach(() => {
            state = withReport(
                withData(getInitializedState(), {
                    visualizationClass: visualizationClassMock(LOCAL_TABLE),
                }),
                {
                    execution: {
                        ...withData(getInitializedState(), {
                            visualizationClass: visualizationClassMock(LOCAL_TABLE),
                        }).report.execution,
                        hasData: true,
                    },
                },
            );
        });

        it("should be true when report is valid", () => {
            expect(isReportValid(state)).toBeTruthy();
        });

        it("should be false when report has not been executed yet", () => {
            state = withReport(state, { execution: { ...state.report.execution, hasData: false } });

            expect(isReportValid(state)).toBeFalsy();
        });

        it("should be false when report is too large to compute", () => {
            state = withReport(state, {
                execution: withExecutionError(state.report.execution, {
                    status: ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
                }),
            });

            expect(isReportValid(state)).toBeFalsy();
        });

        it("should be false when report is too large to display", () => {
            state = withReport(state, {
                execution: withExecutionError(state.report.execution, {
                    status: ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY,
                }),
            });

            expect(isReportValid(state)).toBeFalsy();
        });

        it.each([
            ErrorCodes.BAD_REQUEST,
            ErrorCodes.UNKNOWN_ERROR,
            ErrorCodes.NO_DATA,
            PluggableVisualizationErrorCodes.INVALID_BUCKETS,
            PluggableVisualizationErrorCodes.EMPTY_AFM,
        ])("should be false when report execution status is %s", (status: string) => {
            state = withReport(state, {
                execution: withExecutionError(state.report.execution, { status: status }),
            });
            expect(isReportValid(state)).toBeFalsy();
        });

        it("should be false when report is missing data", () => {
            state = withData(getInitializedState(), {
                visualizationClass: visualizationClassMock(LOCAL_COLUMN),
            });

            expect(isReportValid(state)).toBeFalsy();
        });
    });

    describe("isReportExecutableSelector", () => {
        it("should return true if report has measures", () => {
            const mdObject: IVisualizationObjectContent = {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    definition: { measureDefinition: { item: { identifier: "foo" } } },
                                    localIdentifier: "foo",
                                },
                            },
                        ],
                    },
                ],
                visualizationClass: {
                    uri: "local:foo",
                },
            };

            expect(isReportExecutableSelector.resultFunc(mdObject)).toEqual(true);
        });

        it("should return true if report has attributes", () => {
            const mdObject: IVisualizationObjectContent = {
                buckets: [
                    {
                        items: [
                            {
                                visualizationAttribute: {
                                    displayForm: {
                                        identifier: "foo",
                                    },

                                    localIdentifier: "foo",
                                },
                            },
                        ],
                    },
                ],
                visualizationClass: {
                    uri: "local:foo",
                },
            };

            expect(isReportExecutableSelector.resultFunc(mdObject)).toEqual(true);
        });

        it("should return false when report has only filters", () => {
            const mdObject: IVisualizationObjectContent = {
                buckets: [],
                filters: [{ positiveAttributeFilter: { displayForm: { identifier: "foo" }, in: [] } }],
                visualizationClass: {
                    uri: "local:foo",
                },
            };

            expect(isReportExecutableSelector.resultFunc(mdObject)).toEqual(false);
        });
    });

    describe("isUnsupportedConfiguration", () => {
        const staticDateFilterConfig: IDateFilterConfig = {
            granularity: GRANULARITY.DATE,
            interval: ["01/01/2001", "02/02/2002"],
            type: "absolute",
        };
        const relativeDateFilterConfig: IDateFilterConfig = {
            granularity: GRANULARITY.MONTH,
            interval: [-2, -1],
            type: "relative",
        };

        function addViewByDate(state: IAppState, granularity: Granularity) {
            return withData(state, {
                buckets: withReplacedBucket(state.data.buckets, 1, {
                    localIdentifier: "view",
                    items: [
                        {
                            attribute: DATE_DATASET_ATTRIBUTE,
                            granularity,
                        },
                    ],
                }),
            });
        }

        const splyCoparison = OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR;
        const ppComparison = OverTimeComparisonTypes.PREVIOUS_PERIOD;

        it.each`
            description                                                 | expectedResult | filterConfig                | comparisonType   | viewByGranularity
            ${"empty date filter without comparison"}                   | ${false}       | ${undefined}                | ${undefined}     | ${undefined}
            ${"static date filter without comparison"}                  | ${false}       | ${staticDateFilterConfig}   | ${undefined}     | ${undefined}
            ${"static date filter and SPLY comparison"}                 | ${false}       | ${staticDateFilterConfig}   | ${splyCoparison} | ${undefined}
            ${"static date filter and PP comparison"}                   | ${false}       | ${staticDateFilterConfig}   | ${ppComparison}  | ${undefined}
            ${"static date filter and PP comparison viewed by day"}     | ${false}       | ${staticDateFilterConfig}   | ${ppComparison}  | ${GRANULARITY.DATE}
            ${"static date filter and PP comparison viewed by month"}   | ${true}        | ${staticDateFilterConfig}   | ${ppComparison}  | ${GRANULARITY.MONTH}
            ${"static date filter and SPLY comparison viewed by month"} | ${false}       | ${staticDateFilterConfig}   | ${splyCoparison} | ${GRANULARITY.MONTH}
            ${"static date filter viewed by month"}                     | ${false}       | ${staticDateFilterConfig}   | ${undefined}     | ${GRANULARITY.MONTH}
            ${"relative date filter and PP comparison viewed by month"} | ${false}       | ${relativeDateFilterConfig} | ${ppComparison}  | ${GRANULARITY.MONTH}
        `(
            "should return $expectedResult for $description",
            ({ expectedResult, filterConfig, comparisonType, viewByGranularity }) => {
                if (filterConfig) {
                    const dateFilter = buildDateFilterMock({
                        filterConfig,
                    });
                    state = FilterBarService.addFilter(state, dateFilter);
                }
                if (comparisonType) {
                    state = withData(state, {
                        buckets: updateBucketItemsAt(state.data.buckets, 0, (items) => [
                            ...(items ?? []),
                            buildBucketItem({
                                type: METRIC,
                                overTimeComparisonType: comparisonType,
                            }),
                        ]),
                    });
                }
                if (viewByGranularity) {
                    state = addViewByDate(state, viewByGranularity);
                }

                const isUnsupported = isUnsupportedConfiguration(state);

                expect(isUnsupported).toBe(expectedResult);
            },
        );
    });
});
