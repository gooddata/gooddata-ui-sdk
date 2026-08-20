// (C) 2024-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { defSetSorts } from "@gooddata/sdk-model";
import { type IRepeaterProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { repeater as RepeaterScenarios } from "../../../src/scenarios/charts/repeater/index.js";
import { captureProps } from "../../_infra/coreChartMocks.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCorePivotTableProps } from "../../_infra/utils.js";

describe("Repeater", () => {
    const Scenarios: Array<ScenarioAndDescription<IRepeaterProps>> = RepeaterScenarios.flatMap((group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        const promisedInteractions = mountChartAndCapture(scenario);

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;
            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            const promisedInteractions = captureProps((extractProps: () => any) =>
                mountChartAndCapture(scenario, extractProps),
            );

            const interactions = await promisedInteractions;

            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCorePivotTableProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
            const interactions = await promisedInteractions;

            const insight = createInsightDefinitionForChart("Repeater", _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);

            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
