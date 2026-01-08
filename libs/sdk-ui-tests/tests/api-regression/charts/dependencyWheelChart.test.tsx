// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

import { defSetSorts } from "@gooddata/sdk-model";
import { type IDependencyWheelChartProps } from "@gooddata/sdk-ui-charts";

import { dependencyWheelChart as dependencyWheelChartScenarios } from "../../../scenarios/charts/dependencyWheelChart/index.js";
import { type ScenarioAndDescription } from "../../../src/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreDependencyWheelChart", async () => {
    const Original = await vi.importActual<any>(
        "@gooddata/sdk-ui-charts/internal-tests/CoreDependencyWheelChart",
    );
    const { withPropsExtractor } = await import("../../_infra/withProps.js");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CoreDependencyWheelChart: wrap(Original.CoreDependencyWheelChart),
    };
});

describe("DependencyWheelChart", () => {
    const Scenarios: Array<ScenarioAndDescription<IDependencyWheelChartProps>> =
        dependencyWheelChartScenarios.flatMap((group) =>
            group.forTestTypes("api").asScenarioDescAndScenario(),
        );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        const promisedInteractions = mountChartAndCapture(scenario);

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;
            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            const promisedInteractions = mountChartAndCapture(scenario, extractProps);
            const interactions = await promisedInteractions;

            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCoreChartProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
            const interactions = await promisedInteractions;
            const insight = createInsightDefinitionForChart("DependencyWheelChart", _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);
            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);
            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
