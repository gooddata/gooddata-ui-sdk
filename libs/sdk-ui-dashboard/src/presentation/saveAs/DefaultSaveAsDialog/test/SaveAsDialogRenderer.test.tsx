// (C) 2020-2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Input, Message, ConfirmDialog } from "@gooddata/sdk-ui-kit";
import {
    ISaveAsDialogRendererOwnProps,
    SaveAsDialogRenderer,
    SaveAsNewDashboardDialog,
} from "../SaveAsDialogRenderer";
import noop from "lodash/noop";

// const SaveAsNewDashboardDialog = "s-dialog";

describe("Test SaveAsNewDashboardDialog: ", () => {
    const defaultProps: ISaveAsDialogRendererOwnProps = {
        dashboardTitle: "ABC Title",
        isDashboardLoaded: true,
        isDashboardSaving: false,
        isKpiWidgetEnabled: true,
        isScheduleEmailsEnabled: true,
        locale: "en-US",
        onCancel: noop,
        onSubmit: noop,
    };

    function renderComponent(props = defaultProps) {
        return mount(<SaveAsDialogRenderer {...props} />);
    }

    it("Should render correctly", () => {
        const wrapper = renderComponent();
        expect(wrapper.find(ConfirmDialog).length).toEqual(1);
        expect(wrapper.find(Input).length).toBe(1);
        expect(wrapper.find(Message).length).toBe(1);
        expect(wrapper.length).toEqual(1);
        expect(wrapper.find(ConfirmDialog).hasClass("save-as-new-dialog")).toBe(true);
    });

    it("Should display the default title in the title textbox", () => {
        const wrapper = renderComponent();
        const inputComponent = wrapper.find(Input);
        expect(inputComponent.prop("value")).toEqual(`Copy of ${defaultProps.dashboardTitle}`);
        expect(inputComponent.prop("autofocus")).toBeTruthy();
    });

    it("Should get default title when focusing out the input with empty value", () => {
        const wrapper = renderComponent();
        const instance = wrapper.find(SaveAsNewDashboardDialog).instance() as any;
        instance.handleTitleBlur({ target: { value: "" } });
        expect(instance.state.dashboardTitle).toEqual(instance.getDefaultDashboardTitle());

        instance.handleTitleBlur({ target: { value: "   " } });
        expect(instance.state.dashboardTitle).toEqual(instance.getDefaultDashboardTitle());

        instance.handleTitleBlur({ target: { value: "  abc title  " } });
        expect(instance.state.dashboardTitle).toEqual("abc title");
    });

    it("Should allow to save as new dashboard when the page is ready, not in loading|saving status", () => {
        const wrapper = renderComponent();
        let instance = wrapper.find(SaveAsNewDashboardDialog).instance() as any;
        expect(instance.canCreateDashboard()).toBeTruthy();

        instance = renderComponent({
            ...defaultProps,
            isDashboardLoaded: false,
            isDashboardSaving: false,
        })
            .find(SaveAsNewDashboardDialog)
            .instance() as any;
        expect(instance.canCreateDashboard()).toBeFalsy();

        instance = renderComponent({
            ...defaultProps,
            isDashboardLoaded: true,
            isDashboardSaving: true,
        })
            .find(SaveAsNewDashboardDialog)
            .instance() as any;
        expect(instance.canCreateDashboard()).toBeFalsy();
    });

    it("Should allow save as new dashboard when the title is not empty and the page is ready", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ ...defaultProps, onSubmit });
        const dialog = wrapper.find(SaveAsNewDashboardDialog);
        const instance = dialog.instance() as any;
        instance.onSubmit();
        expect(onSubmit).toHaveBeenCalled();
    });

    it("Should not allow save as new dashboard when the title is empty and the page is not ready", () => {
        const onSubmit = jest.fn();
        const wrapper = renderComponent({ ...defaultProps, onSubmit });
        let dialog = wrapper.find(SaveAsNewDashboardDialog);
        let instance = dialog.instance() as any;

        dialog.setState({ dashboardTitle: "   " } as any);
        instance.onSubmit();
        expect(onSubmit).not.toHaveBeenCalled();

        dialog = renderComponent({ ...defaultProps, isDashboardSaving: true }).find(SaveAsNewDashboardDialog);
        instance = dialog.instance() as any;
        instance.onSubmit();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("Should not render note if neither isKpiWidgetEnabled nor isScheduleEmailsEnabled are true", () => {
        const wrapper = renderComponent({
            ...defaultProps,
            isKpiWidgetEnabled: false,
            isScheduleEmailsEnabled: false,
        });

        expect(wrapper.find(Message).length).toBe(0);
    });
});
