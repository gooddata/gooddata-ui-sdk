// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

type CaptureProps = <T>(mount: (extractProps: () => any) => T) => T;

// Prepare hoisted global captureProps variable which gets its value in hoisted mock and then is used in test.
let { captureProps } = vi.hoisted(() => {
    // The suite runs with `isolate: false`, so the module graph is shared between test files. Any test
    // file executed earlier may have already evaluated `PivotTable` against the real
    // `CorePivotTableAgImpl`, and Vitest does not re-execute cached importers when a later file mocks one
    // of their dependencies. Drop the module registry before this file's own imports are evaluated so
    // that the scenarios imported below bind to the mocked `CorePivotTableAgImpl` and the props extractor
    // actually observes the core table props.
    vi.resetModules();

    return { captureProps: null as unknown as CaptureProps };
});

import { defSetSorts } from "@gooddata/sdk-model";
import { type IPivotTableProps } from "@gooddata/sdk-ui-pivot";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { pivotScenarios as pivotTableScenarios } from "../../../src/scenarios/pivotTable/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCorePivotTableProps } from "../../_infra/utils.js";

vi.mock("@gooddata/sdk-ui-pivot/internal-tests/CorePivotTableAgImpl", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-pivot/internal-tests/CorePivotTableAgImpl");
    const { withScopedPropsExtractor } = await import("../../_infra/withProps.js");
    const { captureProps: originalCaptureProps, wrap } = withScopedPropsExtractor();
    captureProps = originalCaptureProps;

    return {
        ...Original,
        CorePivotTableAgImpl: wrap(Original.CorePivotTableAgImpl),
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

describe("PivotTable", () => {
    const Scenarios: Array<ScenarioAndDescription<IPivotTableProps>> = pivotTableScenarios.flatMap((group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        const promisedInteractions = started(mountChartAndCapture(scenario));

        // The core table props have to come from their own mount: the insight definition below is derived
        // from the props of the top-most component, which is what a mount without an extractor captures.
        const promisedCorePropsInteractions = started(
            captureProps((extractProps: () => any) => mountChartAndCapture(scenario, extractProps)),
        );

        const promisedPlugVizInteractions = started(
            promisedInteractions.then((interactions) =>
                mountInsight(scenario, createInsightDefinitionForChart("PivotTable", _desc, interactions)),
            ),
        );

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            const interactions = await promisedCorePropsInteractions;

            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCorePivotTableProps(interactions.effectiveProps)).toMatchSnapshot();
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
