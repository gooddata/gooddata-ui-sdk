// (C) 2007-2019 GoodData Corporation

import { IAreaChartProps } from "@gooddata/sdk-ui";
import areaScenarios from "../../../scenarios/charts/areaChart";
import { ScenarioTestInput } from "../../../src";
import { createInsightDefinitionForChart } from "../../_infra/insightFactory";
import { mountChartAndCapture } from "../../_infra/render";
import { mountInsight } from "../../_infra/renderPlugVis";
import { cleanupCoreChartProps } from "../../_infra/utils";
import flatMap = require("lodash/flatMap");

describe("AreaChart", () => {
    const Scenarios: Array<ScenarioTestInput<IAreaChartProps>> = flatMap(areaScenarios, group =>
        group.forTestTypes("api").asTestInput(),
    );

    describe.each(Scenarios)("with %s", (_desc, Component, propsFactory) => {
        const promisedInteractions = mountChartAndCapture(Component, propsFactory, wrapper => {
            return wrapper.find("CoreAreaChart").props();
        });

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCoreChartProps(interactions.effectiveProps)).toMatchSnapshot();
        });

        it("should be transformable to insight definition", async () => {
            const interactions = await promisedInteractions;

            const insight = createInsightDefinitionForChart("AreaChart", _desc, interactions);

            const plugVizInteractions = await mountInsight(insight);

            expect(plugVizInteractions.triggeredExecution).toEqual(interactions.triggeredExecution);
        });
    });
});
