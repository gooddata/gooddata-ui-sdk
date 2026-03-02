// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type DataViewRequests } from "@gooddata/mock-handling";
import {
    type NormalizationState,
    withCustomWorkspaceSettings,
    withEventing,
    withNormalization,
} from "@gooddata/sdk-backend-base";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IExecutionDefinition, type ISettings } from "@gooddata/sdk-model";

/**
 * Recorded chart interactions
 */
export type ChartInteractions = {
    /**
     * The execution that was actually triggered
     */
    triggeredExecution?: IExecutionDefinition;
    /**
     * All executions triggered during rendering (in call order).
     */
    triggeredExecutions: IExecutionDefinition[];

    /**
     * If execution normalization is in effect, then this describes what the
     * normalization process did.
     */
    normalizationState?: NormalizationState;
    /**
     * All normalization states observed during rendering (in call order).
     */
    normalizationStates: NormalizationState[];

    /**
     * What data views were requested during rendering
     */
    dataViewRequests: DataViewRequests;

    /**
     * Error captured from execution phase (before result read).
     */
    executionError?: unknown;

    effectiveProps?: any;
};

/**
 * Creates an instance of backend which captures interactions with the execution service. The captured
 * interactions are resolved as soon as all data or data window is requested on the execution result.
 */
export function backendWithCapturing(
    normalize: boolean = false,
    backendSetting?: ISettings,
): [IAnalyticalBackend, Promise<ChartInteractions>] {
    const interactions: ChartInteractions = {
        triggeredExecutions: [],
        normalizationStates: [],
        dataViewRequests: {},
    };

    let dataRequestResolver: (interactions: ChartInteractions) => void;
    let dataRequestRejecter: (error: Error) => void;
    const capturedInteractions = new Promise<ChartInteractions>((resolve, reject) => {
        dataRequestResolver = resolve;
        dataRequestRejecter = reject;
    });
    let resolveTimer: ReturnType<typeof setTimeout> | undefined;
    let hasDataRequest = false;
    let resolved = false;

    const scheduleResolve = () => {
        if (!hasDataRequest || resolved) {
            return;
        }

        if (resolveTimer) {
            clearTimeout(resolveTimer);
        }

        // Allow batched async callbacks from multi-execution visualizations to settle.
        resolveTimer = setTimeout(() => {
            if (resolved) {
                return;
            }
            resolved = true;
            dataRequestResolver(interactions);
        }, 5);
    };

    let backend = withEventing(
        dummyBackend({ hostname: "test", raiseNoDataExceptions: "without-data-view" }),
        {
            beforeExecute: (def) => {
                interactions.triggeredExecutions.push(def);
                // Keep the first execution captured. For visualizations that trigger multiple
                // executions (e.g., multi-layer GeoChart), this preserves the primary one.
                interactions.triggeredExecution ??= def;
                scheduleResolve();
            },
            successfulResultReadAll: (_) => {
                interactions.dataViewRequests.allData = true;
                hasDataRequest = true;
                scheduleResolve();
            },
            failedResultReadAll: (_) => {
                interactions.dataViewRequests.allData = true;
                hasDataRequest = true;
                scheduleResolve();
            },
            successfulResultReadWindow: (offset: number[], size: number[]) => {
                if (!interactions.dataViewRequests.windows) {
                    interactions.dataViewRequests.windows = [];
                }

                interactions.dataViewRequests.windows.push({ offset, size });
                hasDataRequest = true;
                scheduleResolve();
            },
            failedResultReadWindow: (offset: number[], size: number[]) => {
                if (!interactions.dataViewRequests.windows) {
                    interactions.dataViewRequests.windows = [];
                }

                interactions.dataViewRequests.windows.push({ offset, size });
                hasDataRequest = true;
                scheduleResolve();
            },
            failedExecute: (error: unknown) => {
                interactions.executionError = error;
                if (resolved) {
                    return;
                }
                resolved = true;
                if (error instanceof Error) {
                    dataRequestRejecter(error);
                } else {
                    dataRequestRejecter(new Error(String(error)));
                }
            },
        },
    );

    if (normalize) {
        backend = withNormalization(backend, {
            normalizationStatus: (state: NormalizationState) => {
                interactions.normalizationStates.push(state);
                // Same as execution capture above: preserve first (primary) normalization.
                interactions.normalizationState ??= state;
                scheduleResolve();
            },
        });
    }

    if (!isEmpty(backendSetting)) {
        backend = withCustomWorkspaceSettings(backend, {
            commonSettingsWrapper: (settings: ISettings) => {
                return {
                    ...settings,
                    ...backendSetting,
                };
            },
        });
    }

    return [backend, capturedInteractions];
}
