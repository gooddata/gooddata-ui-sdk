// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Treemap } from "../Treemap";
import { CoreTreemap } from "../CoreTreemap";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

describe("Treemap", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <Treemap workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />,
        );
        expect(wrapper.find(CoreTreemap)).toHaveLength(1);
    });
});
