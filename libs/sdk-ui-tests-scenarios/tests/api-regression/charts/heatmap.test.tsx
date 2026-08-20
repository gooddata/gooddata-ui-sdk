// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

// The suite runs with `isolate: false`, so the module graph is shared between test files. Any test
// file executed earlier may have already evaluated `Heatmap` against the real `CoreHeatmap`, and
// Vitest does not re-execute cached importers when a later file mocks one of their dependencies.
// Drop the module registry before this file's own imports are evaluated so that the scenarios
// imported below bind to the mocked `CoreHeatmap` and the props extractor actually observes the
// core chart props.
vi.hoisted(() => {
    vi.resetModules();
});

import { defSetSorts } from "@gooddata/sdk-model";
import { type IHeatmapProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { heatmap as heatmapScenarios } from "../../../src/scenarios/charts/heatmap/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreHeatmap", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreHeatmap");
    const { withPropsExtractor } = await import("../../_infra/withProps.js");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CoreHeatmap: wrap(Original.CoreHeatmap),
    };
});

describe("Heatmap", () => {
    const Scenarios: Array<ScenarioAndDescription<IHeatmapProps>> = heatmapScenarios.flatMap((group) =>
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

            const insight = createInsightDefinitionForChart("Heatmap", _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);

            // remove sorts from both original and plug viz exec - simply because plug vis will automatically
            // create sorts
            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
