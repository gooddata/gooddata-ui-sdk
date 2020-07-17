// (C) 2007-2019 GoodData Corporation

import geoScenarios from "../../../scenarios/geo/index";
import { ScenarioAndDescription } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";
import flatMap from "lodash/flatMap";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory";
import { cleanupGeoChartProps } from "../../_infra/utils";
import { mountInsight } from "../../_infra/renderPlugVis";
import { defSetSorts } from "@gooddata/sdk-model";
import { ReactWrapper } from "enzyme";

const Chart = "GeoPushpinChart";

describe(Chart, () => {
    const Scenarios: Array<ScenarioAndDescription<IGeoPushpinChartProps>> = flatMap(geoScenarios, (group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        const promisedInteractions = mountChartAndCapture(scenario, (wrapper: ReactWrapper) => {
            return wrapper.find("GeoChartOptionsWrapper").props();
        });

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
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
});
