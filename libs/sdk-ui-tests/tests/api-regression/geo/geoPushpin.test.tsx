// (C) 2007-2019 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { withPropsExtractor } from "../../_infra/withProps.js";
import geoScenarios, { latitudeLongitudeScenarios } from "../../../scenarios/geo/index.js";
import { ScenarioAndDescription } from "../../../src/index.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { IGeoPushpinChartProps, IGeoPushpinChartLatitudeLongitudeProps } from "@gooddata/sdk-ui-geo";
import flatMap from "lodash/flatMap.js";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory.js";
import { cleanupGeoChartProps } from "../../_infra/utils.js";
import { mountInsight } from "../../_infra/renderPlugVis.js";
import { defSetSorts } from "@gooddata/sdk-model";

const Chart = "GeoPushpinChart";

// Prepare hoisted global extractProps variable which gets its value in hoisted mock and then is used in test.
let { extractProps } = vi.hoisted(() => ({
    extractProps: null as any,
}));

vi.mock("@gooddata/sdk-ui-geo/internal-tests/GeoChartOptionsWrapper", async () => {
    const Original = await vi.importActual<any>("@gooddata/sdk-ui-geo/internal-tests/GeoChartOptionsWrapper");
    const { extractProps: originalExtractProps, wrap } = withPropsExtractor();
    extractProps = originalExtractProps;

    return {
        ...Original,
        GeoChartOptionsWrapper: wrap(Original.GeoChartOptionsWrapper),
    };
});

describe(Chart, () => {
    const Scenarios: Array<ScenarioAndDescription<IGeoPushpinChartProps>> = flatMap(geoScenarios, (group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    const latLongScenarios: Array<ScenarioAndDescription<IGeoPushpinChartLatitudeLongitudeProps>> = flatMap(
        latitudeLongitudeScenarios,
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
            expect(cleanupGeoChartProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should lead to same execution when rendered as insight via plug viz", async () => {
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

    describe.each(latLongScenarios)("with %s", (_desc, scenario) => {
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
            expect(cleanupGeoChartProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        // because internal logic of PV creates and removes execution buckets on the go
        // there is no simple way of transforming execution buckets into Insight buckets.
        // And so there are differences between Core comp execution and PV execution
        // This can be solved by https://gooddata.atlassian.net/browse/TNT-1306
        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should lead to same execution when rendered as insight via plug viz", async () => {
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
