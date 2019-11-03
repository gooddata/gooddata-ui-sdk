// (C) 2007-2019 GoodData Corporation

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IAreaChartProps } from "@gooddata/sdk-ui";
import BaseUseCases from "../../../scenarios/charts/areaChart/base";
import { cleanupProps } from "../../../src/utils";
import { shallow } from "enzyme";
import React from "react";

describe("AreaChart API", () => {
    const Scenarios: Array<
        [string, React.ComponentType<IAreaChartProps>, IAreaChartProps]
    > = BaseUseCases.forTestTypes("api").asTestInput(dummyBackend(), "testWorkspace");

    it.each(Scenarios)("should work for %s", (_desc, Component, props) => {
        const wrapper = shallow(<Component {...props} />);

        expect(cleanupProps(wrapper.props())).toMatchSnapshot();
    });
});
