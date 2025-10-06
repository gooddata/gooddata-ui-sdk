// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { IExecuteProps } from "@gooddata/sdk-ui";

import executeScenarios from "../../../scenarios/execute/base.js";
import { ScenarioAndDescription } from "../../../src/index.js";
import { mountChartAndCapture } from "../../_infra/render.js";

const Component = "Execute";

describe(Component, () => {
    const Scenarios: Array<ScenarioAndDescription<IExecuteProps>> = [executeScenarios].flatMap((group) =>
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
