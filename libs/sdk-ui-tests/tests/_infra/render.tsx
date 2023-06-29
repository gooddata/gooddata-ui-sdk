// (C) 2007-2019 GoodData Corporation

import { isNoDataError } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { render } from "@testing-library/react";
import React from "react";
import { IScenario, VisProps } from "../../src/index.js";
import { backendWithCapturing, ChartInteractions } from "./backendWithCapturing.js";
import omit from "lodash/omit.js";

function errorHandler(error: GoodDataSdkError) {
    if (isNoDataError(error.cause)) {
        /*
         * This is expected during tests, executions go against dummy backend that throws no data.
         */
        return;
    }

    console.error("Possibly unexpected exception during mount of the chart", error);
}

type EffectivePropsExtractor = () => any;

async function _mountChartAndCapture<T extends VisProps>(
    scenario: IScenario<T>,
    normalize: boolean,
    effectivePropsExtractor?: EffectivePropsExtractor,
): Promise<ChartInteractions> {
    const [backend, promisedInteractions] = backendWithCapturing(normalize);
    const { propsFactory, component: Component, workspaceType } = scenario;

    const props = propsFactory(backend, workspaceType);
    const customErrorHandler = props.onError;

    if (!customErrorHandler) {
        /*
         * if scenario does not provide its own error handler, then provide one that reduces amount of error
         * logs in the console.
         */
        props.onError = errorHandler;
    }

    render(<Component {...(props as any)} />);

    const interactions = await promisedInteractions;

    // When no props extractor is provided, we conveniently use the props passed to the
    // top-most component that is being rendered.
    interactions.effectiveProps = effectivePropsExtractor ? effectivePropsExtractor() : props;

    if (!customErrorHandler) {
        // make sure error handler injected by this fun is not included in the captured props
        interactions.effectiveProps = omit(interactions.effectiveProps, "onError");
    }

    return interactions;
}

/**
 * Mounts component tested by the scenario and captures significant chart interactions with the rest of the world. Because the
 * chart rendering communicates with backend asynchronously, this function is also async. The returned
 * promise will be resolved as soon as the chart does first request to obtain a data view to visualize.
 *
 * @param scenario - test scenario for a component
 * @param effectivePropsExtractor - function to extract effective props that can be later user for assertions
 */
export async function mountChartAndCapture<T extends VisProps>(
    scenario: IScenario<T>,
    effectivePropsExtractor?: EffectivePropsExtractor,
): Promise<ChartInteractions> {
    return _mountChartAndCapture(scenario, false, effectivePropsExtractor);
}

/**
 * This is identical to {@link mountChartAndCapture} with single exception - the backend is decorated `withNormalization`.
 *
 * Meaning whatever execution definitions are captured represent state _after_ normalization.
 */
export async function mountChartAndCaptureNormalized<T extends VisProps>(
    scenario: IScenario<T>,
): Promise<ChartInteractions> {
    return _mountChartAndCapture(scenario, true);
}
