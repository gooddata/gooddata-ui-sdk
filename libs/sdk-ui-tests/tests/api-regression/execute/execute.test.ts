// (C) 2007-2019 GoodData Corporation

import executeScenarios from "../../../scenarios/execute/base.js";
import { ScenarioAndDescription } from "../../../src/index.js";
import { mountChartAndCapture } from "../../_infra/render.js";
import { IExecuteProps } from "@gooddata/sdk-ui";
import flatMap from "lodash/flatMap.js";
import { describe, it, expect } from "vitest";

const Component = "Execute";

describe(Component, () => {
    const Scenarios: Array<ScenarioAndDescription<IExecuteProps>> = flatMap([executeScenarios], (group) =>
        group.forTestTypes("api").asScenarioDescAndScenario(),
    );

    describe.each(Scenarios)("with %s", (_desc, scenario) => {
        const promisedInteractions = mountChartAndCapture(scenario);

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });
    });
});
