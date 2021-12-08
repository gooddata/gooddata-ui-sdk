// (C) 2007-2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { DonutChart } from "../DonutChart";
import { CoreDonutChart } from "../CoreDonutChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

describe("DonutChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <DonutChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />,
        );
        expect(wrapper.find(CoreDonutChart)).toHaveLength(1);
    });
});
