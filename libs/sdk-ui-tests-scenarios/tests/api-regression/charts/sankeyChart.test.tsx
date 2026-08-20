// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { defSetSorts } from "@gooddata/sdk-model";
import { type ISankeyChartProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { sankeyChart as sankeyChartScenarios } from "../../../src/scenarios/charts/sankeyChart/index.js";
import { captureProps } from "../../_infra/coreChartMocks.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

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

describe("SankeyChart", () => {
    const Scenarios: Array<ScenarioAndDescription<ISankeyChartProps>> = sankeyChartScenarios.flatMap(
        (group) => group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        const promisedInteractions = started(mountChartAndCapture(scenario));

        const promisedCorePropsInteractions = started(
            captureProps((extractProps: () => any) => mountChartAndCapture(scenario, extractProps)),
        );

        const promisedPlugVizInteractions = started(
            promisedInteractions.then((interactions) =>
                mountInsight(scenario, createInsightDefinitionForChart("SankeyChart", _desc, interactions)),
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
            expect(cleanupCoreChartProps(interactions.effectiveProps)).toMatchSnapshot();
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
