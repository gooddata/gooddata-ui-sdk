// (C) 2007-2019 GoodData Corporation

import { IXirrProps } from "@gooddata/sdk-ui";
import xirrScenarios from "../../../scenarios/charts/xirr";
import { ScenarioTestInput } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { cleanupCoreChartProps } from "../../_infra/utils";
import flatMap = require("lodash/flatMap");

describe("XIRR", () => {
    const Scenarios: Array<ScenarioTestInput<IXirrProps>> = flatMap(xirrScenarios, group =>
        group.forTestTypes("api").asTestInput(),
    );

    describe.each(Scenarios)("with %s", (_desc, Component, propsFactory) => {
        const promisedInteractions = mountChartAndCapture(Component, propsFactory, wrapper =>
            wrapper.find("LoadingHOC").props(),
        );

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
