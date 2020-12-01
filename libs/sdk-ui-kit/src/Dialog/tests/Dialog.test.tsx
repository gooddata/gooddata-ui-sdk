// (C) 2007-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Dialog } from "../Dialog";
import { Overlay } from "../../Overlay";

describe("Dialog", () => {
    it("should render content", () => {
        const wrapper = shallow(<Dialog className="dialogTest">DialogTest content</Dialog>);

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(".dialogTest")).toHaveLength(1);
    });
});
