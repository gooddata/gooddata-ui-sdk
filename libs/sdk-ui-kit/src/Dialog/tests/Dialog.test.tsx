// (C) 2007-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import Overlay from "@gooddata/goodstrap/lib/core/Overlay";
import { Dialog } from "../Dialog";

describe("Dialog", () => {
    it("should render content", () => {
        const wrapper = shallow(<Dialog className="dialogTest">DialogTest content</Dialog>);

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(".dialogTest")).toHaveLength(1);
    });
});
