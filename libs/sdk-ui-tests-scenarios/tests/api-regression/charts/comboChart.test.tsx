// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { defSetSorts } from "@gooddata/sdk-model";
import { type IComboChartProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { comboChart as comboChartScenarios } from "../../../src/scenarios/charts/comboChart/index.js";
import { captureProps } from "../../_infra/coreChartMocks.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

describe("ComboChart", () => {
    const Scenarios: Array<ScenarioAndDescription<IComboChartProps>> = comboChartScenarios.flatMap((group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        /*
         * Every mount pays a real-timer debounce in the capturing backend before its interactions promise
         * settles (see `backendWithCapturing`), which dwarfs the actual render cost. Mounting from a test
         * body would serialize one such wait per scenario, so all mounts are kicked off here, during
         * collection, and merely awaited by the tests below - the waits then overlap instead of adding up.
         *
         * The renders themselves are synchronous, so the props the chart passed down to the core chart are
         * read right after the mount call, from inside the `captureProps` callback - that is the only window
         * in which this scenario's capture slot is the active one.
         */
        const [promisedInteractions, coreChartProps] = captureProps((extractProps: () => any) => {
            const promise = mountChartAndCapture(scenario);

            return [promise, extractProps()] as const;
        });

        // The plug viz mount needs the captured execution to build the insight, so it can only be chained
        // onto the mount above - but chaining it here still lets it overlap with the other scenarios.
        const promisedPlugVizInteractions = promisedInteractions.then((interactions) =>
            mountInsight(scenario, createInsightDefinitionForChart("ComboChart", _desc, interactions)),
        );

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", () => {
            expect(coreChartProps).toBeDefined();
            expect(coreChartProps.execution).toBeDefined();
            expect(cleanupCoreChartProps(coreChartProps)).toMatchSnapshot();
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
