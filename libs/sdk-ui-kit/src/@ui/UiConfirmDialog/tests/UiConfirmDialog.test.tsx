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
    it("does not render when isOpen is false", () => {
        renderWithIntl(<UiConfirmDialog {...baseProps} isOpen={false} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders the title and description when open", () => {
        renderWithIntl(<UiConfirmDialog {...baseProps} isOpen />);
        expect(screen.getByText("Remove access?")).toBeInTheDocument();
        expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("calls onClose when Escape is pressed inside the dialog", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiConfirmDialog {...baseProps} isOpen onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when the confirm button is clicked", () => {
        const onConfirm = vi.fn();
        renderWithIntl(<UiConfirmDialog {...baseProps} isOpen onConfirm={onConfirm} />);
        fireEvent.click(screen.getByRole("button", { name: "Remove" }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
