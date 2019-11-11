// (C) 2007-2019 GoodData Corporation

import { dummyBackend, withEventing } from "@gooddata/sdk-backend-mockingbird";
import { isNoDataError } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { ICoreChartProps, RuntimeError } from "@gooddata/sdk-ui";
import { mount } from "enzyme";
import React from "react";
import { PropsFactory, VisProps } from "../../src";
import omit = require("lodash/omit");

/**
 * Recorded chart interactions
 */
export type ChartInteractions = {
    triggeredExecution?: IExecutionDefinition;
    passedToBaseChart?: ICoreChartProps;
};

function errorHandler(error: RuntimeError) {
    if (isNoDataError(error.cause)) {
        /*
         * This is expected during tests, executions go against dummy backend that throws no data.
         */
        return;
    }

    // tslint:disable-next-line:no-console
    console.error("Possibly unexpected exception during enzyme mount of the chart", error);
}

/**
 * Mounts chart component and captures significant chart interactions with the rest of the world.
 *
 * @param Component - chart component to render
 * @param propsFactory - will be called to obtain props for the chart to render
 */
export function mountChartAndCapture<T extends VisProps>(
    Component: React.ComponentType<T>,
    propsFactory: PropsFactory<T>,
): ChartInteractions {
    const interactions: ChartInteractions = {};
    const backend = withEventing(dummyBackend({ hostname: "test", raiseNoDataExceptions: true }), {
        beforeExecute: def => {
            interactions.triggeredExecution = def;
        },
    });

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

    interactions.passedToBaseChart = wrapper.childAt(0).props();

    if (!customErrorHandler) {
        // make sure error handler injected by this fun is not included in the captured props
        interactions.passedToBaseChart = omit(interactions.passedToBaseChart, "onError");
    }

    return interactions;
}
