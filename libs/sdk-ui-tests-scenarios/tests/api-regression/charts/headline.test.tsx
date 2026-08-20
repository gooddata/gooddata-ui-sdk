// (C) 2007-2026 GoodData Corporation

import { beforeAll, describe, expect, it, vi } from "vitest";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => {
    // The suite runs with `isolate: false`, so the module registry is shared between test files. If another
    // file has already pulled in the CoreHeadline module graph, the mock below would never be instantiated
    // and `extractProps` would stay null. Dropping the registry before this file's imports run makes the
    // mock take effect regardless of the order in which vitest happens to schedule the files.
    vi.resetModules();

    return { extractProps: null as any };
});

import { defSetSorts } from "@gooddata/sdk-model";
import { type IHeadlineProps } from "@gooddata/sdk-ui-charts";

import { type ScenarioAndDescription } from "../../../src/index.js";
import { headline as headlineScenarios } from "../../../src/scenarios/charts/headline/index.js";
import { type ChartInteractions } from "../../_infra/backendWithCapturing.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { cleanupCoreChartProps } from "../../_infra/utils.js";

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreHeadline", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreHeadline");
    const { withPropsExtractor } = await import("../../_infra/withProps.js");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        CoreHeadline: wrap(Original.CoreHeadline),
    };
});

describe("Headline", () => {
    const Scenarios: Array<ScenarioAndDescription<IHeadlineProps>> = headlineScenarios.flatMap((group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        /*
         * All three assertions below used to mount the chart themselves, so every scenario rendered the
         * Headline three times. Each mount waits for the capturing backend to settle its debounced resolve
         * timer, which dominated the runtime of this file. The mount is deterministic for a given scenario
         * (same props factory, same dummy backend), so a single render per scenario feeds all three tests.
         *
         * The props extractor is used for the shared mount because `Headline` hands `config` over to
         * `CoreHeadline` untouched - so the captured core props serve both the core-props snapshot and the
         * insight definition built for the plug viz comparison.
         */
        let interactions: ChartInteractions;

        beforeAll(async () => {
            interactions = await mountChartAndCapture(scenario, extractProps);
        });

        it("should create expected execution definition", () => {
            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", () => {
            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCoreChartProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
            const insight = createInsightDefinitionForChart("Headline", _desc, interactions);

            const plugVizInteractions = await mountInsight(scenario, insight);

            // remove sorts from both original and plug viz exec - simply because plug vis will automatically
            // create sorts
            const originalExecutionWithoutSorts = defSetSorts(interactions.triggeredExecution!);
            const executionWithoutSorts = defSetSorts(plugVizInteractions.triggeredExecution!);

            expect(executionWithoutSorts).toEqual(originalExecutionWithoutSorts);
        });
    });
});
