// (C) 2007-2019 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { withPropsExtractor } from "../../_infra/withProps.js";
import { defSetSorts } from "@gooddata/sdk-model";
import { IHeadlineProps } from "@gooddata/sdk-ui-charts";
import headlineScenarios from "../../../scenarios/charts/headline/index.js";
import { ScenarioAndDescription } from "../../../src/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";
import flatMap from "lodash/flatMap.js";

const Chart = "Headline";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreHeadline", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreHeadline");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CoreHeadline: wrap(Original.CoreHeadline),
    };
});

describe(Chart, () => {
    const Scenarios: Array<ScenarioAndDescription<IHeadlineProps>> = flatMap(headlineScenarios, (group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        it("should create expected execution definition", async () => {
            const promisedInteractions = mountChartAndCapture(scenario);
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
            const promisedInteractions = mountChartAndCapture(scenario);
            const interactions = await promisedInteractions;

            const insight = createInsightDefinitionForChart(Chart, _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);

            // remove sorts from both original and plug viz exec - simply because plug vis will automatically
            // create sorts
            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
