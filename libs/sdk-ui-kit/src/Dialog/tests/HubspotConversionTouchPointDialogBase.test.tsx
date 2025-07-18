// (C) 2021-2025 GoodData Corporation
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

import { useHubspotForm } from "@aaronhayes/react-use-hubspot-form";

import {
    HubspotConversionTouchPointDialogBase,
    IHubspotFormField,
} from "../HubspotConversionTouchPointDialogBase.js";
import { IHubspotConversionTouchPointDialogBaseProps } from "../index.js";

interface IFormReadyProps {
    onFormReady: ($form: IHubspotFormField[]) => void;
}

let formReadyCalled = false;

vi.mock("@aaronhayes/react-use-hubspot-form", () => ({
    useHubspotForm: vi.fn().mockImplementation((arg: IFormReadyProps) => {
        if (!formReadyCalled) {
            arg.onFormReady([
                {
                    name: "email",
                    value: "",
                    click: vi.fn(),
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
                    onClose={vi.fn()}
                    onFormSubmitted={vi.fn()}
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
        const spyCancel = vi.fn();
        renderComponent({
            showCancelButton: true,
            onClose: spyCancel,
        });

        await userEvent.click(screen.getByText("Cancel"));

        await waitFor(() => expect(spyCancel).toHaveBeenCalledTimes(1));
    });
});
