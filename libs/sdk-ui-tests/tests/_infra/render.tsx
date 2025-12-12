// (C) 2007-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { omit } from "lodash-es";

import { isNoDataError } from "@gooddata/sdk-backend-spi";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type ChartInteractions, backendWithCapturing } from "./backendWithCapturing.js";
import { type IScenario, type VisProps } from "../../src/index.js";

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
    const { propsFactory, component: Component, workspaceType, backendSettings } = scenario;
    const [backend, promisedInteractions] = backendWithCapturing(normalize, backendSettings);

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
