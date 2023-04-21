// (C) 2007-2019 GoodData Corporation

// These imports and actions need to be done first because of mocks
const Original = jest.requireActual("@gooddata/sdk-ui-charts/dist/charts/sankeyChart/CoreSankeyChart");
import { withPropsExtractor } from "../../_infra/withProps";
const { extractProps, wrap } = withPropsExtractor();

import flatMap from "lodash/flatMap";
import { defSetSorts } from "@gooddata/sdk-model";
import { ISankeyChartProps } from "@gooddata/sdk-ui-charts";
import sankeyChartScenarios from "../../../scenarios/charts/sankeyChart";
import { ScenarioAndDescription } from "../../../src";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory";
import { mountChartAndCapture } from "../../_infra/render";
import { mountInsight } from "../../_infra/renderPlugVis";
import { cleanupCoreChartProps } from "../../_infra/utils";

const Chart = "SankeyChart";

jest.mock("@gooddata/sdk-ui-charts/dist/charts/sankeyChart/CoreSankeyChart", () => ({
    ...jest.requireActual("@gooddata/sdk-ui-charts/dist/charts/sankeyChart/CoreSankeyChart"),
    CoreSankeyChart: wrap(Original.CoreSankeyChart),
}));

describe(Chart, () => {
    const Scenarios: Array<ScenarioAndDescription<ISankeyChartProps>> = flatMap(
        sankeyChartScenarios,
        (group) => group.forTestTypes("api").asScenarioDescAndScenario(),
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

            const insight = createInsightDefinitionForChart(Chart, _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);

            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
