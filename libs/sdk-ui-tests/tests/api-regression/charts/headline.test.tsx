// (C) 2007-2019 GoodData Corporation

import { IHeadlineProps } from "@gooddata/sdk-ui";
import BaseUseCases from "../../../scenarios/charts/headline/base";
import { ScenarioTestInput } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { cleanupCoreChartProps } from "../../_infra/utils";

describe("Headline", () => {
    const Scenarios: Array<ScenarioTestInput<IHeadlineProps>> = BaseUseCases.forTestTypes(
        "api",
    ).asTestInput();

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
