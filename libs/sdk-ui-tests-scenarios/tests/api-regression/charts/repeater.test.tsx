// (C) 2024-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

/*
 * This suite runs with `isolate: false`, so every test file shares a single module registry. The
 * sibling chart suites are skipped, but `describe.skip` still evaluates the module — importing the
 * `@gooddata/sdk-ui-charts` barrel is enough to put a copy of `Repeater`, bound to the real
 * `CoreRepeater`, into that registry. `vi.mock` cannot retroactively rebind an already-evaluated
 * module, so whether the mock below takes effect comes down to the order the sequencer happens to
 * pick: `wrap` never runs and `extractProps()` returns `undefined` when this file is not collected
 * first.
 *
 * Dropping the registry makes the outcome order-independent. It has to happen inside `vi.hoisted`
 * because the imports below are hoisted above plain top-level statements — resetting at statement
 * level would run too late, after the stale modules had already been bound.
 */
vi.hoisted(() => {
    vi.resetModules();
});

import { defSetSorts } from "@gooddata/sdk-model";
import { type IRepeaterProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { repeater as RepeaterScenarios } from "../../../src/scenarios/charts/repeater/index.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCorePivotTableProps } from "../../_infra/utils.js";

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreRepeater", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreRepeater");
    const { withPropsExtractor } = await import("../../_infra/withProps.js");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CoreRepeater: wrap(Original.CoreRepeater),
    };
});

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
            const promisedInteractions = mountChartAndCapture(scenario, extractProps);

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
