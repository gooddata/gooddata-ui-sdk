// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { omit } from "lodash-es";

import { isNoDataError } from "@gooddata/sdk-backend-spi";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type IScenario, type VisProps } from "../../src/index.js";

import { type ChartInteractions, backendWithCapturing } from "./backendWithCapturing.js";
import { sequentialContainer } from "./sequentialMount.js";

function errorHandler(error: GoodDataSdkError) {
    if (isNoDataError(error.cause)) {
        /*
         * This is expected during tests, executions go against dummy backend that throws no data.
         */
        return;
    }

    console.error("Possibly unexpected exception during mount of the chart", error);
}

/*
 * The executions never resolve with data here, so every mount ends up rendering the default loading
 * indicator and - once the dummy backend raises 'no data' - the default error component. The loading
 * indicator alone is an SVG with five elements carrying large inline style objects plus an embedded
 * `@keyframes` stylesheet; happy-dom parses all of that on every single mount. None of it is observed by
 * the suites that opt in below, so they render nothing in those slots instead.
 */
function NoopStatusComponent(): null {
    return null;
}

type EffectivePropsExtractor = () => any;

type MountOptions = {
    /**
     * Container to render into. Only pass a reused container from mounts that never overlap,
     * see {@link sequentialContainer}.
     */
    container?: HTMLElement;
    /**
     * Replaces the loading and error indicators with components that render nothing. Only for suites
     * that assert on the captured execution rather than on the rendered markup.
     */
    stubStatusComponents?: boolean;
};

async function _mountChartAndCapture<T extends VisProps>(
    scenario: IScenario<T>,
    normalize: boolean,
    effectivePropsExtractor?: EffectivePropsExtractor,
    options: MountOptions = {},
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

    if (options.stubStatusComponents) {
        (props as any).LoadingComponent ??= NoopStatusComponent;
        (props as any).ErrorComponent ??= NoopStatusComponent;
    }

    render(<Component {...(props as any)} />, options.container ? { container: options.container } : {});

    // When no props extractor is provided, we conveniently use the props passed to the
    // top-most component that is being rendered.
    //
    // The extraction has to happen synchronously right after the render: the extractor is backed by a
    // single slot that each render overwrites, so awaiting first would make concurrently mounted
    // scenarios observe each other's props.
    const capturedProps = effectivePropsExtractor ? effectivePropsExtractor() : props;

    const interactions = await promisedInteractions;

    interactions.effectiveProps = capturedProps;
    interactions.componentProps = props;

    if (!customErrorHandler) {
        // make sure error handler injected by this fun is not included in the captured props
        interactions.effectiveProps = omit(interactions.effectiveProps, "onError");
        // when no extractor is in play both fields describe the same props, so reuse the cleaned object
        interactions.componentProps = effectivePropsExtractor
            ? omit(interactions.componentProps, "onError")
            : interactions.effectiveProps;
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
 *
 * This entry point is exclusive to the smoke-and-capture sweep, which mounts one scenario at a time and
 * only ever looks at the execution the mount triggered - so it renders into a reused container and skips
 * the loading/error indicators.
 */
export async function mountChartAndCaptureNormalized<T extends VisProps>(
    scenario: IScenario<T>,
): Promise<ChartInteractions> {
    return _mountChartAndCapture(scenario, true, undefined, {
        container: sequentialContainer("chart"),
        stubStatusComponents: true,
    });
}
