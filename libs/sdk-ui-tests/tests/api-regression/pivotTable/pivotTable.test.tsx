// (C) 2007-2019 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { withPropsExtractor } from "../../_infra/withProps.js";
import pivotTableScenarios from "../../../scenarios/pivotTable/index.js";
import { ScenarioAndDescription } from "../../../src/index.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { cleanupCorePivotTableProps } from "../../_infra/utils.js";
import { IPivotTableProps } from "@gooddata/sdk-ui-pivot";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { defSetSorts } from "@gooddata/sdk-model";
import { flatMap } from "lodash-es";

const Vis = "PivotTable";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

vi.mock("@gooddata/sdk-ui-pivot/internal-tests/CorePivotTableAgImpl", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-pivot/internal-tests/CorePivotTableAgImpl");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CorePivotTableAgImpl: wrap(Original.CorePivotTableAgImpl),
    };
});

describe(Vis, () => {
    const Scenarios: Array<ScenarioAndDescription<IPivotTableProps>> = flatMap(pivotTableScenarios, (group) =>
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
