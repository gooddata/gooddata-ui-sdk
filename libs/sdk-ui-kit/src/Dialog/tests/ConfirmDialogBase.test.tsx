// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfirmDialogBase } from "../ConfirmDialogBase";

describe("ConfirmDialogBase", () => {
    it("should render content", () => {
        render(
            <ConfirmDialogBase>
                <div className="test-content">ReactConfirmDialogBase content</div>
            </ConfirmDialogBase>,
        );

        expect(screen.getByText("ReactConfirmDialogBase content")).toBeInTheDocument();
    });

    it("should call cancel handler", async () => {
        const cancelSpy = jest.fn();
        render(
            <ConfirmDialogBase onCancel={cancelSpy} cancelButtonText="Cancel">
                ConfirmDialogBase content
            </ConfirmDialogBase>,
        );

        await userEvent.click(screen.getByText("Cancel"));
        await waitFor(() => expect(cancelSpy).toHaveBeenCalledTimes(1));
    });

    it("should call submit handler", async () => {
        const submitSpy = jest.fn();
        render(
            <ConfirmDialogBase onSubmit={submitSpy} submitButtonText="Submit">
                ConfirmDialogBase content
            </ConfirmDialogBase>,
        );

        await userEvent.click(screen.getByText("Submit"));

        await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    });
});
