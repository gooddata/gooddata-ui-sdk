// (C) 2007-2022 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { ConfirmDialogBase } from "../ConfirmDialogBase";

describe("ConfirmDialogBase", () => {
    it("should render content", () => {
        const wrapper = shallow(
            <ConfirmDialogBase>
                <div className="test-content">ReactConfirmDialogBase content</div>
            </ConfirmDialogBase>,
        );

        expect(wrapper.find(".gd-dialog-header")).toHaveLength(1);
        expect(wrapper.find(".gd-dialog-footer")).toHaveLength(1);
        expect(wrapper.find(".gd-dialog-content")).toHaveLength(1);

        expect(wrapper.find(".test-content")).toHaveLength(1);

        wrapper.unmount();
    });

    it("should call cancel handler", () => {
        const cancelSpy = jest.fn();
        const wrapper = shallow(
            <ConfirmDialogBase onCancel={cancelSpy}>ConfirmDialogBase content</ConfirmDialogBase>,
        );

        wrapper.find(".s-dialog-cancel-button").first().simulate("click");
        expect(cancelSpy).toHaveBeenCalledTimes(1);

        wrapper.unmount();
    });

    it("should call submit handler", () => {
        const submitSpy = jest.fn();
        const wrapper = shallow(
            <ConfirmDialogBase onSubmit={submitSpy} submitButtonText="Submit">
                ConfirmDialogBase content
            </ConfirmDialogBase>,
        );

        wrapper.find(".s-dialog-submit-button").first().simulate("click");
        expect(submitSpy).toHaveBeenCalledTimes(1);

        wrapper.unmount();
    });
});
