// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { DonutChart } from "../DonutChart";
import { CoreDonutChart } from "../CoreDonutChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceLdm } from "@gooddata/reference-workspace";

describe("DonutChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <DonutChart workspace="foo" backend={dummyBackend()} measures={[ReferenceLdm.Amount]} />,
        );
        expect(wrapper.find(CoreDonutChart)).toHaveLength(1);
    });
});
