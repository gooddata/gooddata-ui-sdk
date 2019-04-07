// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { factory } from "@gooddata/gooddata-js";

import { ComboChart as AfmComboChart } from "../afm/ComboChart";
import { ComboChart } from "../ComboChart";
import { M1, M2 } from "./fixtures/buckets";

describe("ComboChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(
            <ComboChart
                projectId="foo"
                primaryMeasures={[M1]}
                secondaryMeasures={[M2]}
                sdk={factory({ domain: "example.com" })}
            />,
        );
        expect(wrapper.find(AfmComboChart)).toHaveLength(1);
    });
});
