// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

// The suite runs with `isolate: false`, so the module registry is shared across test files. Any earlier
// file that pulls in `@gooddata/sdk-ui-charts` binds ComboChart to the real CoreComboChart, which would
// make the mock below a no-op. Dropping the registry here forces this file's imports to re-evaluate.
vi.hoisted(() => {
    vi.resetModules();
});

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

import { defSetSorts } from "@gooddata/sdk-model";
import { type IComboChartProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { comboChart as comboChartScenarios } from "../../../src/scenarios/charts/comboChart/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreComboChart", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreComboChart");
    const { withPropsExtractor } = await import("../../_infra/withProps.js");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CoreComboChart: wrap(Original.CoreComboChart),
    };
});

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
         * read right after the mount call. Reading them later would be wrong: the extractor is a single
         * module-level closure that only ever holds the props of the most recently rendered core chart.
         */
        const promisedInteractions = mountChartAndCapture(scenario);
        const coreChartProps = extractProps();

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
