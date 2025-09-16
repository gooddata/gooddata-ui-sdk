// (C) 2007-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialogBase } from "../ConfirmDialogBase.js";

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
        const cancelSpy = vi.fn();
        render(
            <ConfirmDialogBase onCancel={cancelSpy} cancelButtonText="Cancel">
                ConfirmDialogBase content
            </ConfirmDialogBase>,
        );

        await userEvent.click(screen.getByText("Cancel"));
        await waitFor(() => expect(cancelSpy).toHaveBeenCalledTimes(1));
    });

    it("should call submit handler", async () => {
        const submitSpy = vi.fn();
        render(
            <ConfirmDialogBase onSubmit={submitSpy} submitButtonText="Submit">
                ConfirmDialogBase content
            </ConfirmDialogBase>,
        );

        await userEvent.click(screen.getByText("Submit"));

        await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    });
});
