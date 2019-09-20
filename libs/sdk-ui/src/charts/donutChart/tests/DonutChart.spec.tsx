// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { DonutChart } from "../DonutChart";
import { M1 } from "../../tests/fixtures/buckets";
import { CoreDonutChart } from "../CoreDonutChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

describe("DonutChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(<DonutChart workspace="foo" backend={dummyBackend()} measures={[M1]} />);
        expect(wrapper.find(CoreDonutChart)).toHaveLength(1);
    });
});
