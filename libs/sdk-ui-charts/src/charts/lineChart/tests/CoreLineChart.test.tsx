// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";

import { CoreLineChart } from "../CoreLineChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { prepareExecution } from "@gooddata/sdk-backend-spi";
import { emptyDef } from "@gooddata/sdk-model";
import { BaseChart } from "../../_base/BaseChart";

describe("LineChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(
            <CoreLineChart execution={prepareExecution(dummyBackend(), emptyDef("testWorkspace"))} />,
        );
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
