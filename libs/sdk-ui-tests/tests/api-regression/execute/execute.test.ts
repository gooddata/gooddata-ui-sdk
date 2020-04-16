// (C) 2007-2019 GoodData Corporation

import executeScenarios from "../../../scenarios/execute/base";
import { ScenarioTestInput } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { IExecuteProps } from "@gooddata/sdk-ui";
import flatMap = require("lodash/flatMap");

const Component = "Execute";

describe(Component, () => {
    const Scenarios: Array<ScenarioTestInput<IExecuteProps>> = flatMap([executeScenarios], group =>
        group.forTestTypes("api").asTestInput(),
    );

    describe.each(Scenarios)("with %s", (_desc, Component, propsFactory) => {
        const promisedInteractions = mountChartAndCapture(Component, propsFactory);

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });
    });
});
