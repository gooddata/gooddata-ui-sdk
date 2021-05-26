// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { ConfirmDialog } from "../ConfirmDialog";
import { Overlay } from "../../Overlay";

describe("ConfirmDialog", () => {
    it("should render content", () => {
        const wrapper = mount(
            <ConfirmDialog className="confirmDialogTest" containerClassName="containerTestClass">
                ReactConfirmDialog content
            </ConfirmDialog>,
        );

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(".confirmDialogTest").hostNodes()).toHaveLength(1);
        expect(wrapper.find(".containerTestClass").hostNodes()).toHaveLength(1);
    });
});
