// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";

import { CoreAreaChart } from "../CoreAreaChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { prepareExecution } from "@gooddata/sdk-backend-spi";
import { emptyDef } from "@gooddata/sdk-model";
import { BaseChart } from "../../_base/BaseChart";

describe("AreaChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(
            <CoreAreaChart execution={prepareExecution(dummyBackend(), emptyDef("testWorkspace"))} />,
        );
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
