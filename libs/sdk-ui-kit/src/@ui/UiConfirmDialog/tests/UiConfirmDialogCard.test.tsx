// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiConfirmDialogCard } from "../UiConfirmDialogCard.js";

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

describe("UiConfirmDialogCard", () => {
    it("renders the title and description", () => {
        renderWithIntl(<UiConfirmDialogCard {...baseProps} />);
        expect(screen.getByRole("heading", { name: "Remove access?" })).toBeInTheDocument();
        expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("renders the confirmLabel on the primary button", () => {
        renderWithIntl(<UiConfirmDialogCard {...baseProps} confirmLabel="Transfer" />);
        expect(screen.getByRole("button", { name: "Transfer" })).toBeInTheDocument();
    });

    it("calls onConfirm when the confirm button is clicked", () => {
        const onConfirm = vi.fn();
        renderWithIntl(<UiConfirmDialogCard {...baseProps} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByRole("button", { name: "Remove" }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when the footer Cancel button is clicked", () => {
        const onCancel = vi.fn();
        renderWithIntl(<UiConfirmDialogCard {...baseProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the header X button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiConfirmDialogCard {...baseProps} onClose={onClose} />);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders ReactNode descriptions", () => {
        renderWithIntl(
            <UiConfirmDialogCard
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
        renderWithIntl(<UiConfirmDialogCard {...baseProps} dataTestId="confirm" />);
        expect(screen.getByTestId("confirm")).toBeInTheDocument();
    });
});
