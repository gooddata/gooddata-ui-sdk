// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { Treemap } from "../Treemap";
import { M1 } from "../../tests/fixtures/buckets";
import { CoreTreemap } from "../CoreTreemap";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

describe("Treemap", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(<Treemap workspace="foo" backend={dummyBackend()} measures={[M1]} />);
        expect(wrapper.find(CoreTreemap)).toHaveLength(1);
    });
});
