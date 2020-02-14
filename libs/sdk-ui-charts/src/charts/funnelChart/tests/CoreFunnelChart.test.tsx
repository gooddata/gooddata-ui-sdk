// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { CoreFunnelChart } from "../CoreFunnelChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { prepareExecution } from "@gooddata/sdk-backend-spi";
import { emptyDef } from "@gooddata/sdk-model";
import { BaseChart } from "../../_base/BaseChart";

describe("FunnelChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(
            <CoreFunnelChart execution={prepareExecution(dummyBackend(), emptyDef("testWorkspace"))} />,
        );
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
