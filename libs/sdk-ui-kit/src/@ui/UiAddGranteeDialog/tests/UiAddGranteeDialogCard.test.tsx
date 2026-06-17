// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiAddGranteeDialogCard } from "../UiAddGranteeDialogCard.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const baseProps = {
    objectTitle: "Customer",
    loadOptions: () => Promise.resolve({ groups: [], users: [] }),
    selectedGrantees: [] as const,
    onSelectedGranteesChange: () => {},
    onBack: () => {},
    onClose: () => {},
    onCancel: () => {},
    onShare: () => {},
};

describe("UiAddGranteeDialogCard", () => {
    it("renders the dialog title with the object name interpolated", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} />);
        expect(screen.getByRole("heading", { name: 'Share "Customer"' })).toBeInTheDocument();
    });

    it("renders the embedded grantee picker (search combobox)", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} />);
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("calls onBack when the back button is clicked", () => {
        const onBack = vi.fn();
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} onBack={onBack} />);
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the X button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} onClose={onClose} />);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when the footer Cancel button is clicked", () => {
        const onCancel = vi.fn();
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onShare when the footer primary button is clicked", () => {
        const onShare = vi.fn();
        renderWithIntl(
            <UiAddGranteeDialogCard
                {...baseProps}
                onShare={onShare}
                selectedGrantees={[{ id: "u1", kind: "user", name: "Jane", permissionLevel: "VIEW" }]}
            />,
        );
        fireEvent.click(screen.getByRole("button", { name: "Add" }));
        expect(onShare).toHaveBeenCalledTimes(1);
    });

    it("disables the primary button while no grantee is picked", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} />);
        expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    });

    it("enables the primary button once at least one grantee is picked", () => {
        renderWithIntl(
            <UiAddGranteeDialogCard
                {...baseProps}
                selectedGrantees={[{ id: "u1", kind: "user", name: "Jane", permissionLevel: "VIEW" }]}
            />,
        );
        expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiAddGranteeDialogCard {...baseProps} dataTestId="add-dialog" />);
        expect(screen.getByTestId("add-dialog")).toBeInTheDocument();
    });
});
