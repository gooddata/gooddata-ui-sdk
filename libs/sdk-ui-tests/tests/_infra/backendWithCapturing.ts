// (C) 2020 GoodData Corporation

import { dummyBackend, withEventing } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";

export type DataViewRequests = {
    allData?: boolean;
    windows?: RequestedWindow[];
};

export type RequestedWindow = {
    offset: number[];
    size: number[];
};

/**
 * Recorded chart interactions
 */
export type ChartInteractions = {
    triggeredExecution?: IExecutionDefinition;
    dataViewRequests: DataViewRequests;
    effectiveProps?: any;
};

/**
 * Creates an instance of backend which captures interactions with the execution service. The captured
 * interactions are resolved as soon as all data or data window is requested on the execution result.
 */
export function backendWithCapturing(): [IAnalyticalBackend, Promise<ChartInteractions>] {
    const interactions: ChartInteractions = {
        dataViewRequests: {},
    };

    let dataRequestResolver: (interactions: ChartInteractions) => void;
    const capturedInteractions = new Promise<ChartInteractions>(resolve => {
        dataRequestResolver = resolve;
    });

    const backend = withEventing(dummyBackend({ hostname: "test", raiseNoDataExceptions: true }), {
        beforeExecute: def => {
            interactions.triggeredExecution = def;
        },
        failedResultReadAll: _ => {
            interactions.dataViewRequests.allData = true;

            dataRequestResolver(interactions);
        },
        failedResultReadWindow: (offset: number[], size: number[]) => {
            if (!interactions.dataViewRequests.windows) {
                interactions.dataViewRequests.windows = [];
            }

            interactions.dataViewRequests.windows.push({ offset, size });

            dataRequestResolver(interactions);
        },
    });

    return [backend, capturedInteractions];
}
