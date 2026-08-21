// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { defSetSorts } from "@gooddata/sdk-model";
import { type IBarChartProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { barChart as barChartScenarios } from "../../../src/scenarios/charts/barChart/index.js";
import { captureProps } from "../../_infra/coreChartMocks.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

describe("BarChart", () => {
    const Scenarios: Array<ScenarioAndDescription<IBarChartProps>> = barChartScenarios.flatMap((group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        // A single mount serves all three tests below. The extractor is handed over right here so that the
        // very same mount yields both the core chart props (`effectiveProps`) and the scenario-level props
        // (`componentProps`) - previously the core props were obtained by mounting the chart a second time
        // inside the test, doubling the number of renders this file performs.
        const promisedInteractions = captureProps((extractProps: () => any) =>
            mountChartAndCapture(scenario, extractProps),
        );

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCoreChartProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
            const interactions = await promisedInteractions;

            // the insight is reconstructed from the props the scenario passed to `BarChart`, not from the
            // core chart props the extractor captured
            const insight = createInsightDefinitionForChart("BarChart", _desc, {
                ...interactions,
                effectiveProps: interactions.componentProps,
            });

            const plugVizInteractions = await mountInsight(scenario, insight);

            // remove sorts from both original and plug viz exec - simply because plug vis will automatically
            // create sorts
            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
