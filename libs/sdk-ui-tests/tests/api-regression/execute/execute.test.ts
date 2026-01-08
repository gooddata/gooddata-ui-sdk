// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExecuteProps } from "@gooddata/sdk-ui";

import { executeScenarios } from "../../../scenarios/execute/base.js";
import { type ScenarioAndDescription } from "../../../src/index.js";
import { mountChartAndCapture } from "../../_infra/render.js";

describe("Execute", () => {
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
