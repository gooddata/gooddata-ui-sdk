// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { factory } from "@gooddata/gooddata-js";

import { DonutChart as AfmDonutChart } from "../afm/DonutChart";
import { DonutChart } from "../DonutChart";
import { M1 } from "./fixtures/buckets";

describe("DonutChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(
            <DonutChart projectId="foo" measures={[M1]} sdk={factory({ domain: "example.com" })} />,
        );
        expect(wrapper.find(AfmDonutChart)).toHaveLength(1);
    });
});
