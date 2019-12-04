// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";

import { DonutChart } from "../DonutChart";
import { CoreDonutChart } from "../CoreDonutChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { M1 } from "../../tests/fixtures";

describe("DonutChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(<DonutChart workspace="foo" backend={dummyBackend()} measures={[M1]} />);
        expect(wrapper.find(CoreDonutChart)).toHaveLength(1);
    });
});
