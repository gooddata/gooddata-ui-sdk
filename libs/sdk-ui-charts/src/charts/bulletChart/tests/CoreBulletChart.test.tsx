// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";

import { CoreBulletChart } from "../CoreBulletChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { prepareExecution } from "@gooddata/sdk-backend-spi";
import { emptyDef } from "@gooddata/sdk-model";
import { BaseChart } from "../../_base/BaseChart";

describe("BarChart", () => {
    it("should render BaseChart", () => {
        const wrapper = shallow(
            <CoreBulletChart execution={prepareExecution(dummyBackend(), emptyDef("testWorkspace"))} />,
        );
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
