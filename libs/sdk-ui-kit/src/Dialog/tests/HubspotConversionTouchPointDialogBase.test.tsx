// (C) 2021-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { useHubspotForm } from "@aaronhayes/react-use-hubspot-form";

import {
    HubspotConversionTouchPointDialogBase,
    IHubspotFormField,
} from "../HubspotConversionTouchPointDialogBase";
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
        return render(
            <IntlWrapper locale="en-US">
                <HubspotConversionTouchPointDialogBase
                    onClose={jest.fn()}
                    onFormSubmitted={jest.fn()}
                    values={{ email: "test@gooddata.com", clientId: "23984723" }}
                    dialogTitle="How can we help!"
                    hubspotPortalId="98798"
                    hubspotFormId="09w9uewioewoproewopdsfmks"
                    cancelButtonText="Cancel"
                    {...props}
                />
            </IntlWrapper>,
        );
    }

    it("should render content", () => {
        renderComponent();

        expect(useHubspotForm).toHaveBeenCalled();
        expect(screen.getByText("How can we help!")).toBeInTheDocument();
        expect(document.querySelector("#conversion-touch-point-hubspot")).toBeInTheDocument();
    });

    it("should have dynamic the target id", () => {
        renderComponent({
            targetId: "targetId",
        });

        expect(useHubspotForm).toHaveBeenCalled();
        expect(document.querySelector("#targetId")).toBeInTheDocument();
    });

    it("Should not display the cancel button", () => {
        renderComponent({
            showCancelButton: false,
        });

        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });

    it("Should call the onClose function when clicking on the cancel button", async () => {
        const spyCancel = jest.fn();
        renderComponent({
            showCancelButton: true,
            onClose: spyCancel,
        });

        await userEvent.click(screen.getByText("Cancel"));

        await waitFor(() => expect(spyCancel).toHaveBeenCalledTimes(1));
    });
});
