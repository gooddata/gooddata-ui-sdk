// (C) 2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { useHubspotForm } from "@aaronhayes/react-use-hubspot-form";

import {
    HubspotConversionTouchPointDialogBase,
    IHubspotFormField,
} from "../HubspotConversionTouchPointDialogBase";
import { Button } from "../../Button";
import { IHubspotConversionTouchPointDialogBaseProps } from "../index";

interface IFormReadyProps {
    onFormReady: ($form: IHubspotFormField[]) => void;
}

let formReadyCalled = false;

jest.mock("@aaronhayes/react-use-hubspot-form", () => ({
    useHubspotForm: jest.fn().mockImplementation((arg: IFormReadyProps) => {
        if (!formReadyCalled) {
            arg.onFormReady([
                {
                    name: "email",
                    value: "",
                    click: jest.fn(),
                },
            ]);
            formReadyCalled = true;
        }

        return {
            formCreated: true,
        };
    }),
}));

describe("HubspotConversionTouchPointDialogBase", () => {
    function renderComponent(props: Partial<IHubspotConversionTouchPointDialogBaseProps> = {}) {
        formReadyCalled = false;
        return mount(
            <IntlWrapper locale="en-US">
                <HubspotConversionTouchPointDialogBase
                    onClose={jest.fn()}
                    onFormSubmitted={jest.fn()}
                    values={{ email: "test@gooddata.com", clientId: "23984723" }}
                    dialogTitle="How can we help!"
                    hubspotPortalId="98798"
                    hubspotFormId="09w9uewioewoproewopdsfmks"
                    {...props}
                />
            </IntlWrapper>,
        );
    }

    it("should render content", () => {
        const wrapper = renderComponent();

        expect(useHubspotForm).toHaveBeenCalled();
        expect(wrapper.find("h3").first().text()).toBe("How can we help!");
        expect(wrapper.find("#conversion-touch-point-hubspot")).toHaveLength(1);
    });

    it("should have dynamic the target id", () => {
        const wrapper = renderComponent({
            targetId: "targetId",
        });

        expect(useHubspotForm).toHaveBeenCalled();
        expect(wrapper.find("#targetId")).toHaveLength(1);
    });

    it("Should not display the cancel button", () => {
        const wrapper = renderComponent({
            showCancelButton: false,
        });

        expect(wrapper.find(Button)).toHaveLength(0);
    });

    it("Should call the onClose function when clicking on the cancel button", () => {
        const spyCancel = jest.fn();
        const wrapper = renderComponent({
            showCancelButton: true,
            cancelButtonText: "Cancel",
            onClose: spyCancel,
        });

        const cancelButton = wrapper.find(Button);

        cancelButton.simulate("click");

        expect(spyCancel).toHaveBeenCalledTimes(1);
    });
});
