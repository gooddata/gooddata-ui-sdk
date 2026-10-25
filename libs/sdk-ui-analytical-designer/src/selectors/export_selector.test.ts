// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IVisualizationClassBody } from "@gooddata/sdk-model";
import { ErrorCodes } from "@gooddata/sdk-ui";
import { PluggableVisualizationErrorCodes } from "@gooddata/sdk-ui-ext/internal";

import { MEASURES, STACK, VIEW } from "../constants/bucket.js";
import { LOCAL_PUSHPIN } from "../constants/visualization_types.js";
import { type IAppState } from "../store/types.js";
import { withExecutionError } from "../tests/report_builder.test.helpers.js";
import { withData, withReport } from "../tests/state_builder.test.helpers.js";

import { getIsReportEmpty, hasReportError } from "./export_selector.js";
import {
    bucketsAddItem,
    createStateWithMeasureDateDatasets,
    setErrorReportNegativeValue,
} from "./test_helpers.js";

describe("exportSelector", () => {
    function createInitialState(): IAppState {
        let state = createStateWithMeasureDateDatasets();
        state = withData(state, {
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
                {
                    localIdentifier: STACK,
                    items: [],
                },
            ],
        });
        return state;
    }

    function setEmptyReport(state: IAppState): IAppState {
        return withReport(state, {
            execution: withExecutionError(state.report.execution, { status: ErrorCodes.NO_DATA }),
        });
    }

    function setInvalidConfiguration(state: IAppState): IAppState {
        return withReport(state, {
            execution: withExecutionError(state.report.execution, { status: ErrorCodes.BAD_REQUEST }),
        });
    }

    function setMissingMetricReport(state: IAppState): IAppState {
        return withReport(state, {
            execution: withExecutionError(state.report.execution, {
                status: PluggableVisualizationErrorCodes.INVALID_BUCKETS,
            }),
        });
    }

    function setMissingLocationGeoPushpin(state: IAppState): IAppState {
        return withReport(
            withData(state, {
                visualizationClass: {
                    visualizationClass: {
                        ...state.data.visualizationClass,
                        url: LOCAL_PUSHPIN,
                    } as unknown as IVisualizationClassBody,
                },
            }),
            {
                execution: withExecutionError(
                    withData(state, {
                        visualizationClass: {
                            visualizationClass: {
                                ...state.data.visualizationClass,
                                url: LOCAL_PUSHPIN,
                            } as unknown as IVisualizationClassBody,
                        },
                    }).report.execution,
                    { status: ErrorCodes.GEO_LOCATION_MISSING },
                ),
            },
        );
    }

    function setTooLargeReport(state: IAppState): IAppState {
        return withReport(state, {
            execution: withExecutionError(state.report.execution, {
                status: ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY,
            }),
        });
    }

    function setRunningExecutionReport(state: IAppState): IAppState {
        return withReport(state, { execution: { ...state.report.execution, running: true } });
    }

    function setProtectedReport(state: IAppState): IAppState {
        return withReport(state, {
            execution: withExecutionError(state.report.execution, { status: ErrorCodes.PROTECTED_REPORT }),
        });
    }

    describe("hasReportError", () => {
        it("should hasReportError return false when there is no error", () => {
            const state = createInitialState();
            expect(hasReportError(state)).toEqual(false);
        });

        it.each([
            ["has invalid configuration", setInvalidConfiguration],
            ["has negative value", setErrorReportNegativeValue],
            ["is empty", setEmptyReport],
            ["is missing metric", setMissingMetricReport],
            ["is GeoPushpin missing location", setMissingLocationGeoPushpin],
            ["is too large", setTooLargeReport],
            ["is running execution", setRunningExecutionReport],
            ["has protected", setProtectedReport],
        ])(
            "should hasReportError return true when report %s",
            (_errorType: string, setUpFunction: (state: IAppState) => IAppState) => {
                let state = createInitialState();
                state = setUpFunction(state);
                expect(hasReportError(state)).toEqual(true);
            },
        );
    });

    describe("getIsReportEmpty", () => {
        it("should getIsReportEmpty return true when report has no data", () => {
            const state = createInitialState();
            expect(getIsReportEmpty(state)).toEqual(true);
        });

        it("should getIsReportEmpty return false when report has data", () => {
            let state = createInitialState();
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
            });
            expect(getIsReportEmpty(state)).toEqual(false);
        });
    });
});
