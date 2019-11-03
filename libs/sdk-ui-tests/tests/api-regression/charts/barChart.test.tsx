// (C) 2007-2019 GoodData Corporation

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IBarChartProps } from "@gooddata/sdk-ui";
import BaseUseCases from "../../../scenarios/charts/barChart/base";
import { cleanupProps } from "../../../src/utils";
import { shallow } from "enzyme";
import React from "react";

describe("BarChart API", () => {
    const Scenarios: Array<
        [string, React.ComponentType<IBarChartProps>, IBarChartProps]
    > = BaseUseCases.forTestTypes("api").asTestInput(dummyBackend(), "testWorkspace");

    it.each(Scenarios)("should work for %s", (_desc, Component, props) => {
        const wrapper = shallow(<Component {...props} />);

        expect(cleanupProps(wrapper.props())).toMatchSnapshot();
    });
});
