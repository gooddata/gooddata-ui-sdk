// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Dialog } from "../Dialog";
import { Overlay } from "../../Overlay";

describe("Dialog", () => {
    it("should render content", () => {
        const wrapper = mount(
            <Dialog className="dialogTest" containerClassName="containerTestClass">
                DialogTest content
            </Dialog>,
        );

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(".dialogTest").hostNodes()).toHaveLength(1);
        expect(wrapper.find(".containerTestClass").hostNodes()).toHaveLength(1);
    });
});
