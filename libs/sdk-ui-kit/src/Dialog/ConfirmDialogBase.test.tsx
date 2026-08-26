// (C) 2007-2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { ConfirmDialogFooter } from "./ConfirmDialogFooter.js";

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

describe("ConfirmDialogBase footerRenderer", () => {
    it("renders the default footer when footerRenderer is not passed", () => {
        render(
            <ConfirmDialogBase cancelButtonText="Cancel" submitButtonText="Submit">
                content
            </ConfirmDialogBase>,
        );
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();
        expect(document.getElementById("confirm-dialog-base-id")).toBeInTheDocument();
    });

    it("replaces the whole footer element when footerRenderer is passed", () => {
        render(
            <ConfirmDialogBase
                cancelButtonText="Cancel"
                submitButtonText="Submit"
                footerRenderer={() => <div data-testid="custom-footer" />}
            >
                content
            </ConfirmDialogBase>,
        );
        expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
        expect(screen.queryByText("Submit")).not.toBeInTheDocument();
        expect(document.querySelector(".gd-dialog-footer")).toBeNull();
    });

    it("footerRenderer takes precedence over footerLeftRenderer", () => {
        render(
            <ConfirmDialogBase
                footerRenderer={() => <div data-testid="custom-footer" />}
                footerLeftRenderer={() => <div data-testid="footer-left" />}
            >
                content
            </ConfirmDialogBase>,
        );
        expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
        expect(screen.queryByTestId("footer-left")).not.toBeInTheDocument();
    });
});

describe("ConfirmDialogFooter", () => {
    it("renders footerLeft, cancel and submit with the submit-button contracts", async () => {
        const onSubmit = vi.fn();
        render(
            <ConfirmDialogFooter
                footerLeft={<div data-testid="footer-left" />}
                cancelButtonText="Cancel"
                submitButtonText="Submit"
                onSubmit={onSubmit}
            />,
        );
        expect(screen.getByTestId("footer-left")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        const submit = document.getElementById("confirm-dialog-base-id");
        expect(submit).toBeInTheDocument();
        await userEvent.click(screen.getByText("Submit"));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });

    it("disables submit and shows the spinner", () => {
        render(
            <ConfirmDialogFooter
                cancelButtonText="Cancel"
                submitButtonText="Submit"
                isSubmitDisabled
                showProgressIndicator
            />,
        );
        expect(document.querySelector(".s-dialog-submit-button")).toHaveAttribute("aria-disabled", "true");
        expect(document.querySelector(".gd-dialog-spinner")).toBeInTheDocument();
    });
});
