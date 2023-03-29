// (C) 2007-2019 GoodData Corporation

// These imports and actions need to be done first because of mocks
const Original = jest.requireActual("@gooddata/sdk-ui-geo/dist/core/geoChart/GeoChartOptionsWrapper");
import { withPropsExtractor } from "../../_infra/withProps";
const { extractProps, wrap } = withPropsExtractor();

import geoScenarios, { latitudeLongitudeScenarios } from "../../../scenarios/geo/index";
import { ScenarioAndDescription } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { IGeoPushpinChartProps, IGeoPushpinChartLatitudeLongitudeProps } from "@gooddata/sdk-ui-geo";
import flatMap from "lodash/flatMap";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory";
import { cleanupGeoChartProps } from "../../_infra/utils";
import { mountInsight } from "../../_infra/renderPlugVis";
import { defSetSorts } from "@gooddata/sdk-model";

const Chart = "GeoPushpinChart";

jest.mock("@gooddata/sdk-ui-geo/dist/core/geoChart/GeoChartOptionsWrapper", () => ({
    ...jest.requireActual("@gooddata/sdk-ui-geo/dist/core/geoChart/GeoChartOptionsWrapper"),
    GeoChartOptionsWrapper: wrap(Original.GeoChartOptionsWrapper),
}));

describe(Chart, () => {
    const Scenarios: Array<ScenarioAndDescription<IGeoPushpinChartProps>> = flatMap(geoScenarios, (group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    const latLongScenarios: Array<ScenarioAndDescription<IGeoPushpinChartLatitudeLongitudeProps>> = flatMap(
        latitudeLongitudeScenarios,
        (group) => group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each([Scenarios[0]])("with %s", (_desc, scenario) => {
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
