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
 * Schedules `cb` on the next macrotask and returns a canceller.
 *
 * Node clamps `setTimeout(cb, 0)` to a full millisecond, so a timer-based settle costs ~1ms of pure
 * idling per mount. Every scenario mounts twice (react component + pluggable visualization), so with
 * several thousand scenarios in this package that clamp alone accounted for roughly half of the
 * smoke-and-capture wall-clock time. `setImmediate` gives the same guarantee we actually need - it
 * runs in the check phase, i.e. only after the microtask queue has fully drained - for free.
 */
const scheduleMacrotask: (cb: () => void) => () => void =
    typeof setImmediate === "function"
        ? (cb) => {
              const handle = setImmediate(cb);

              return () => clearImmediate(handle);
          }
        : (cb) => {
              const handle = setTimeout(cb, 0);

              return () => clearTimeout(handle);
          };

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

    /**
     * Props that were handed to the top-most component rendered by the scenario.
     *
     * This is always captured, also when the mount extracts `effectiveProps` from somewhere deeper in the
     * tree (e.g. the core chart). It lets a single mount serve both the core-props assertions and the
     * insight reconstruction, which needs the scenario-level props.
     */
    componentProps?: any;
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
    let cancelResolve: (() => void) | undefined;
    let hasDataRequest = false;
    let resolved = false;

    const scheduleResolve = () => {
        if (!hasDataRequest || resolved) {
            return;
        }

        cancelResolve?.();

        // Allow batched async callbacks from multi-execution visualizations to settle. A single macrotask
        // hop is enough: it fires only after the whole microtask queue has drained, so any follow-up
        // execution chained off a promise gets to call scheduleResolve() again and push the resolution out.
        // Keep it at the cheapest possible hop - every mount awaits it, so any padding here is paid as
        // wall-clock time by each of the several thousand scenario tests in this package.
        cancelResolve = scheduleMacrotask(() => {
            if (resolved) {
                return;
            }
            resolved = true;
            dataRequestResolver(interactions);
        });
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
