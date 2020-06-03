// (C) 2007-2019 GoodData Corporation

import pivotTableScenarios from "../../../scenarios/pivotTable";
import { ScenarioAndDescription } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { cleanupCorePivotTableProps } from "../../_infra/utils";
import { IPivotTableProps } from "@gooddata/sdk-ui-pivot";
import { ReactWrapper } from "enzyme";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory";
import { mountInsight } from "../../_infra/renderPlugVis";
import { defSetSorts } from "@gooddata/sdk-model";
import flatMap = require("lodash/flatMap");

function tablePropsExtractor(wrapper: ReactWrapper): any {
    const child = wrapper.find("CorePivotTablePure");

    return child.props();
}

const Vis = "PivotTable";

describe(Vis, () => {
    const Scenarios: Array<ScenarioAndDescription<IPivotTableProps>> = flatMap(pivotTableScenarios, group =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        const promisedInteractions = mountChartAndCapture(scenario, tablePropsExtractor);

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCorePivotTableProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
            const interactions = await promisedInteractions;

            const insight = createInsightDefinitionForChart(Vis, _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);

            // remove sorts from both original and plug viz exec - simply because plug vis will automatically
            // create sorts
            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
