// (C) 2007-2019 GoodData Corporation

import { IFunnelChartProps } from "@gooddata/sdk-ui";
import funnelChartScenarios from "../../../scenarios/charts/funnelChart";
import { ScenarioTestInput } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { cleanupCoreChartProps } from "../../_infra/utils";
import flatMap = require("lodash/flatMap");

describe("FunnelChart", () => {
    const Scenarios: Array<ScenarioTestInput<IFunnelChartProps>> = flatMap(funnelChartScenarios, group =>
        group.forTestTypes("api").asTestInput(),
    );

    describe.each(Scenarios)("with %s", (_desc, Component, propsFactory) => {
        const interactions = mountChartAndCapture(Component, propsFactory);

        it("should create expected execution definition", () => {
            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", () => {
            expect(interactions.passedToBaseChart).toBeDefined();
            expect(interactions.passedToBaseChart!.execution).toBeDefined();
            expect(cleanupCoreChartProps(interactions.passedToBaseChart)).toMatchSnapshot();
        });
    });
});
