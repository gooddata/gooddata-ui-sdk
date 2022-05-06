// (C) 2022 GoodData Corporation

import { mount } from "enzyme";
import React from "react";

import { DialogListHeader, IDialogListHeaderProps } from "../DialogListHeader";

const BUTTON_SELECTOR = ".s-dialog-list-header-button";

describe("DialogListHeader", () => {
    const render = (props?: IDialogListHeaderProps) => {
        return mount(<DialogListHeader {...props} />);
    };

    it("should call onClick when clicked on button", () => {
        const onButtonClickMock = jest.fn();
        const wrapper = render({ onButtonClick: onButtonClickMock, buttonTitle: "Add" });

        wrapper.find(BUTTON_SELECTOR).hostNodes().simulate("click");

        expect(onButtonClickMock).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when clicked on disabled button", () => {
        const onButtonClickMock = jest.fn();
        const wrapper = render({
            onButtonClick: onButtonClickMock,
            buttonTitle: "Add",
            buttonDisabled: true,
        });

        wrapper.find(BUTTON_SELECTOR).hostNodes().simulate("click");

        expect(onButtonClickMock).toHaveBeenCalledTimes(0);
    });
});
