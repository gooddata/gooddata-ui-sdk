// (C) 2007-2019 GoodData Corporation

import { dummyBackend, withEventing } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, isNoDataError } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { mount, ReactWrapper } from "enzyme";
import React from "react";
import { PropsFactory, VisProps } from "../../src";
import omit = require("lodash/omit");

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

function errorHandler(error: GoodDataSdkError) {
    if (isNoDataError(error.cause)) {
        /*
         * This is expected during tests, executions go against dummy backend that throws no data.
         */
        return;
    }

    // tslint:disable-next-line:no-console
    console.error("Possibly unexpected exception during enzyme mount of the chart", error);
}

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

export type EffectivePropsExtractor = (wrapper: ReactWrapper) => any;

const immediateChildPropsExtractor: EffectivePropsExtractor = (wrapper: ReactWrapper): any => {
    return wrapper.childAt(0).props();
};

/**
 * Mounts chart component and captures significant chart interactions with the rest of the world. Because the
 * chart rendering communicates with backend asynchronously, this function is also async. The returned
 * promise will be resolved as soon as the chart does first request to obtain a data view to visualize.
 *
 * @param Component - chart component to render
 * @param propsFactory - will be called to obtain props for the chart to render
 * @param effectivePropsExtractor - function to extract effective props that can be later user for assertions
 */
export async function mountChartAndCapture<T extends VisProps>(
    Component: React.ComponentType<T>,
    propsFactory: PropsFactory<T>,
    effectivePropsExtractor: EffectivePropsExtractor = immediateChildPropsExtractor,
): Promise<ChartInteractions> {
    const [backend, promisedInteractions] = backendWithCapturing();

    const props = propsFactory(backend, "testWorkspace");
    const customErrorHandler = props.onError;

    if (!customErrorHandler) {
        /*
         * if scenario does not provide its own error handler, then provide one that reduces amount of error
         * logs in the console.
         */
        props.onError = errorHandler;
    }

    const wrapper = mount(<Component {...(props as any)} />);
    const interactions = await promisedInteractions;

    interactions.effectiveProps = effectivePropsExtractor(wrapper);

    if (!customErrorHandler) {
        // make sure error handler injected by this fun is not included in the captured props
        interactions.effectiveProps = omit(interactions.effectiveProps, "onError");
    }

    return interactions;
}
