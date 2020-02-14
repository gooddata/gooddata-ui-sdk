// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { Headline } from "../Headline";
import { CoreHeadline } from "../CoreHeadline";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceLdm } from "@gooddata/reference-workspace";

describe("Headline", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <Headline workspace="foo" primaryMeasure={ReferenceLdm.Amount} backend={dummyBackend()} />,
        );
        expect(wrapper.find(CoreHeadline)).toHaveLength(1);
    });
});
