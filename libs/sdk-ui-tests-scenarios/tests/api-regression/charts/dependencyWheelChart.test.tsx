// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

type CaptureProps = <T>(mount: (extractProps: () => any) => T) => T;

// Prepare hoisted global captureProps variable which gets its value in hoisted mock and then is used in test.
let { captureProps } = vi.hoisted(() => {
    // The suite runs with `isolate: false`, so the module graph is shared between test files. Any test file
    // executed earlier may have already evaluated `DependencyWheelChart` against the real
    // `CoreDependencyWheelChart`, and Vitest does not re-execute cached importers when a later file mocks one
    // of their dependencies. Drop the module registry before this file's own imports are evaluated so that
    // the scenarios imported below bind to the mocked `CoreDependencyWheelChart` and the props extractor
    // actually observes the core chart props.
    vi.resetModules();

    return { captureProps: null as unknown as CaptureProps };
});

import { defSetSorts } from "@gooddata/sdk-model";
import { type IDependencyWheelChartProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { dependencyWheelChart as dependencyWheelChartScenarios } from "../../../src/scenarios/charts/dependencyWheelChart/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreDependencyWheelChart", async () => {
    const Original = await vi.importActual<any>(
        "@gooddata/sdk-ui-charts/internal-tests/CoreDependencyWheelChart",
    );
    const { withScopedPropsExtractor } = await import("../../_infra/withProps.js");
    const { captureProps: originalCaptureProps, wrap } = withScopedPropsExtractor();
    captureProps = originalCaptureProps;

    return {
        ...Original,
        CoreDependencyWheelChart: wrap(Original.CoreDependencyWheelChart),
    };
});

/**
 * Every mount resolves only once its capturing backend has debounced (a real timer per mount), so a mount
 * started inside `it` costs that wait sequentially - once per scenario, per test. Starting all mounts during
 * collection instead lets those timers run concurrently across scenarios and turns the whole file's
 * accumulated wait into roughly one debounce.
 *
 * The catch handler keeps a rejection from being reported as an unhandled rejection during collection; the
 * returned promise still rejects, so the test that awaits it is the one that fails.
 */
function started<T>(promise: Promise<T>): Promise<T> {
    promise.catch(() => {
        /* reported by the test awaiting this promise */
    });

    return promise;
}

describe("DependencyWheelChart", () => {
    const Scenarios: Array<ScenarioAndDescription<IDependencyWheelChartProps>> =
        dependencyWheelChartScenarios.flatMap((group) =>
            group.forTestTypes("api").asScenarioDescAndScenario(),
        );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        /*
         * A single chart mount serves both the execution-definition and the core-props assertions. The mount
         * renders the (mocked) core chart synchronously, so the scoped extractor already holds this
         * scenario's core props by the time `mountChartAndCapture` yields on the backend debounce - no second
         * mount of the same chart is needed. `interactions.effectiveProps` is left as the top-level scenario
         * props, which is what the plug viz insight definition below is built from.
         */
        const [promisedInteractions, coreProps] = captureProps((extractProps: () => any) => {
            const promise = started(mountChartAndCapture(scenario));

            return [promise, extractProps()] as const;
        });

        const promisedPlugVizInteractions = started(
            promisedInteractions.then((interactions) =>
                mountInsight(
                    scenario,
                    createInsightDefinitionForChart("DependencyWheelChart", _desc, interactions),
                ),
            ),
        );

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            await promisedInteractions;

            expect(coreProps).toBeDefined();
            expect(coreProps.execution).toBeDefined();
            expect(cleanupCoreChartProps(coreProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
            const interactions = await promisedInteractions;
            const plugVizInteractions = await promisedPlugVizInteractions;

            // remove sorts from both original and plug viz exec - simply because plug vis will automatically
            // create sorts
            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
