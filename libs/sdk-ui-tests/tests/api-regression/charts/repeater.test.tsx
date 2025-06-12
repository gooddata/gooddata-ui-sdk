// (C) 2024 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { withPropsExtractor } from "../../_infra/withProps.js";
import flatMap from "lodash/flatMap.js";
import { defSetSorts } from "@gooddata/sdk-model";
import { IRepeaterProps } from "@gooddata/sdk-ui-charts";
import RepeaterScenarios from "../../../scenarios/charts/repeater/index.js";
import { ScenarioAndDescription } from "../../../src/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCorePivotTableProps } from "../../_infra/utils.js";

const Chart = "Repeater";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreRepeater", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreRepeater");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CoreRepeater: wrap(Original.CoreRepeater),
    };
});

describe(Chart, () => {
    const Scenarios: Array<ScenarioAndDescription<IRepeaterProps>> = flatMap(RepeaterScenarios, (group) =>
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
            expect(cleanupCorePivotTableProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
            const interactions = await promisedInteractions;

            const insight = createInsightDefinitionForChart(Chart, _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);

            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
