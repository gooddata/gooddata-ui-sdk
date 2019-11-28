// (C) 2007-2019 GoodData Corporation

import { IScatterPlotProps } from "@gooddata/sdk-ui";
import scatterPlotScenarios from "../../../scenarios/charts/scatterPlot";
import { ScenarioTestInput } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { cleanupCoreChartProps } from "../../_infra/utils";
import flatMap = require("lodash/flatMap");

describe("ScatterPlot", () => {
    const Scenarios: Array<ScenarioTestInput<IScatterPlotProps>> = flatMap(scatterPlotScenarios, group =>
        group.forTestTypes("api").asTestInput(),
    );

    describe.each(Scenarios)("with %s", (_desc, Component, propsFactory) => {
        const promisedInteractions = mountChartAndCapture(Component, propsFactory);

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
    });
});
