// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiConfirmDialog } from "../UiConfirmDialog.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const baseProps = {
    title: "Remove access?",
    description: "Are you sure?",
    confirmLabel: "Remove",
    onClose: () => {},
    onCancel: () => {},
    onConfirm: () => {},
};

describe("UiConfirmDialog", () => {
    it("renders the title and description", () => {
        renderWithIntl(<UiConfirmDialog {...baseProps} />);
        expect(screen.getByRole("dialog", { name: "Remove access?" })).toBeInTheDocument();
        expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("renders the confirmLabel on the primary button", () => {
        renderWithIntl(<UiConfirmDialog {...baseProps} confirmLabel="Transfer" />);
        expect(screen.getByRole("button", { name: "Transfer" })).toBeInTheDocument();
    });

    it("calls onConfirm when the confirm button is clicked", () => {
        const onConfirm = vi.fn();
        renderWithIntl(<UiConfirmDialog {...baseProps} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByRole("button", { name: "Remove" }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when the footer Cancel button is clicked", () => {
        const onCancel = vi.fn();
        renderWithIntl(<UiConfirmDialog {...baseProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the header X button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiConfirmDialog {...baseProps} onClose={onClose} />);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape is pressed (modal behaviour)", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiConfirmDialog {...baseProps} onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders with aria-modal=true (modal behaviour)", () => {
        renderWithIntl(<UiConfirmDialog {...baseProps} />);
        expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("renders ReactNode descriptions", () => {
        renderWithIntl(
            <UiConfirmDialog
                {...baseProps}
                description={
                    <>
                        Hello <strong>world</strong>
                    </>
                }
            />,
        );
        expect(screen.getByText("world")).toBeInTheDocument();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiConfirmDialog {...baseProps} dataTestId="confirm" />);
        expect(screen.getByTestId("confirm")).toBeInTheDocument();
    });
});
