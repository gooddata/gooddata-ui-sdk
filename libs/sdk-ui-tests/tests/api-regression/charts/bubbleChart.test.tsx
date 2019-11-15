// (C) 2007-2019 GoodData Corporation

import { IBubbleChartProps } from "@gooddata/sdk-ui";
import BaseUseCases from "../../../scenarios/charts/bubbleChart/base";
import { ScenarioTestInput } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { cleanupCoreChartProps } from "../../_infra/utils";

describe("BubbleChart", () => {
    const Scenarios: Array<ScenarioTestInput<IBubbleChartProps>> = BaseUseCases.forTestTypes(
        "api",
    ).asTestInput();

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
