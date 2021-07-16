// (C) 2007-2021 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";
import { DefaultLocale, withIntl } from "@gooddata/sdk-ui";

import KpiAlertDialog, { IKpiAlertDialogProps } from "../KpiAlertDialog";
import { translations } from "../../../../../../localization";

const DEFAULT_DATE_FORMAT = "MM/dd/yyyy";

const defaultProps: IKpiAlertDialogProps = {
    dateFormat: DEFAULT_DATE_FORMAT,
    onAlertDialogCloseClick: noop,
    onAlertDialogDeleteClick: noop,
    onAlertDialogSaveClick: noop,
    onAlertDialogUpdateClick: noop,
    onApplyAlertFiltersClick: noop,
    userEmail: "user@gooddata.com",
};

function renderKpiAlertDialog(options: Partial<IKpiAlertDialogProps>) {
    const Wrapped: React.ComponentType<IKpiAlertDialogProps> = withIntl(
        KpiAlertDialog,
        undefined,
        translations[DefaultLocale],
    );
    return mount(<Wrapped {...defaultProps} {...options} />);
}

function changeInput(input: ReactWrapper, value: string) {
    input.simulate("change", { target: { value } });
}

describe("KpiAlertDialog", () => {
    function findPortalInWrapper(wrapper: ReactWrapper) {
        return wrapper.find(".s-portal-scroll-anchor").childAt(0);
    }

    function findButtonInPortal(wrapper: ReactWrapper) {
        const portalWrapper = findPortalInWrapper(wrapper);
        return portalWrapper.find("button.s-save_button");
    }

    function renderComponent(customProps: Partial<IKpiAlertDialogProps> = {}) {
        const wrapper = renderKpiAlertDialog({
            isThresholdRepresentingPercent: true,
            ...customProps,
        });

        const kpiAlertDialog = wrapper.find(KpiAlertDialog);
        const portalWrapper = findPortalInWrapper(wrapper);
        const input = portalWrapper.find(".s-threshold-input input");
        const button = portalWrapper.find("button.s-save_button");

        return {
            kpiAlertDialog,
            input,
            button,
            wrapper,
        };
    }

    it("should have disabled save button when threshold is empty", () => {
        const { input, wrapper } = renderComponent();

        changeInput(input, "");
        const button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(true);
    });

    it("should have disabled save button when threshold is invalid", () => {
        const { input, wrapper } = renderComponent();

        changeInput(input, "foo!bar");
        const button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(true);
    });

    it("should have enabled save button when threshold is valid", () => {
        const { input, wrapper } = renderComponent();

        changeInput(input, "123");
        const button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(false);
    });

    it("should switch save button state from enabled to disabled when invalid threshold inserted", () => {
        const { input, wrapper } = renderComponent();
        let button;

        expect(input.text()).toEqual("");
        button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(true);

        changeInput(input, "123.45");
        button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(false);

        changeInput(input, "123.45.");
        button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(true);
    });

    it("should switch save button state from disabled to enabled when valid threshold inserted", () => {
        const { input, wrapper } = renderComponent();
        let button;

        expect(input.text()).toEqual("");
        button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(true);

        changeInput(input, "123.45.");
        button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(true);

        changeInput(input, "123.45");
        button = findButtonInPortal(wrapper);
        expect(button.hasClass("disabled")).toEqual(false);
    });

    it("should not try to save alert when input threshold empty", () => {
        const onAlertDialogSaveClick = jest.fn();
        const { input, button } = renderComponent({ onAlertDialogSaveClick });

        button.simulate("click");

        expect(input.text()).toEqual("");
        expect(onAlertDialogSaveClick).not.toHaveBeenCalled();
    });

    it("should not try to save alert when threshold is invalid", () => {
        const onAlertDialogSaveClick = jest.fn();
        const { input, button } = renderComponent({ onAlertDialogSaveClick });

        changeInput(input, "foo!bar");
        button.simulate("click");

        expect(onAlertDialogSaveClick).not.toHaveBeenCalled();
    });

    it("should try to save alert with threshold divided by 100", () => {
        const onAlertDialogSaveClick = jest.fn();
        const { input, button } = renderComponent({ onAlertDialogSaveClick });

        changeInput(input, "12.0045");
        button.simulate("click");

        expect(onAlertDialogSaveClick).toHaveBeenCalledWith(0.120045, "aboveThreshold");
    });
});
