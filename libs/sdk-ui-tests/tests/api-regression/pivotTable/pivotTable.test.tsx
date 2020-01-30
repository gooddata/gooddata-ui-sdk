// (C) 2007-2019 GoodData Corporation

import pivotTableScenarios from "../../../scenarios/pivotTable";
import { ScenarioTestInput } from "../../../src";
import { mountChartAndCapture } from "../../_infra/render";
import { cleanupCorePivotTableProps } from "../../_infra/utils";
import { IPivotTableProps } from "@gooddata/sdk-ui";
import { ReactWrapper } from "enzyme";
import flatMap = require("lodash/flatMap");

function tablePropsExtractor(wrapper: ReactWrapper): any {
    const child = wrapper.find("CorePivotTablePure");

    return child.props();
}

describe("PivotTable", () => {
    const Scenarios: Array<ScenarioTestInput<IPivotTableProps>> = flatMap(pivotTableScenarios, group =>
        group.forTestTypes("api").asTestInput(),
    );

    describe.each(Scenarios)("with %s", (_desc, Component, propsFactory) => {
        const promisedInteractions = mountChartAndCapture(Component, propsFactory, tablePropsExtractor);

        it("should create expected execution definition", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.triggeredExecution).toMatchSnapshot();
        });

        it("should create expected props for core chart", async () => {
            const interactions = await promisedInteractions;

            expect(interactions.effectiveProps).toBeDefined();
            expect(interactions.effectiveProps!.execution).toBeDefined();
            expect(cleanupCorePivotTableProps(interactions.effectiveProps)).toMatchSnapshot();
        });
    });
});
