// (C) 2007-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { ConfirmDialog } from "../ConfirmDialog";
import { Overlay } from "../../Overlay";

describe("ConfirmDialog", () => {
    it("should render content", () => {
        const wrapper = shallow(
            <ConfirmDialog className="confirmDialogTest">ReactConfirmDialog content</ConfirmDialog>,
        );

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(".confirmDialogTest")).toHaveLength(1);
    });
});
