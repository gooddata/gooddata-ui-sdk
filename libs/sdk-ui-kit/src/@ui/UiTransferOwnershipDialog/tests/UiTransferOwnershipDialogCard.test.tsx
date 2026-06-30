// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiTransferOwnershipDialogCard } from "../UiTransferOwnershipDialogCard.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const owner = { id: "user:u1", kind: "user" as const, name: "Jane Good", email: "jane.good@company.com" };

const baseProps = {
    objectTitle: "Customer",
    loadOptions: () => Promise.resolve({ groups: [], users: [] }),
    selectedOwner: undefined,
    onSelectedOwnerChange: () => {},
    alsoRemoveMyAccess: false,
    onAlsoRemoveMyAccessChange: () => {},
    onBack: () => {},
    onClose: () => {},
    onCancel: () => {},
    onTransfer: () => {},
};

describe("UiTransferOwnershipDialogCard", () => {
    it("renders the dialog title with the object name interpolated", () => {
        renderWithIntl(<UiTransferOwnershipDialogCard {...baseProps} />);
        expect(screen.getByRole("heading", { name: 'Transfer ownership of "Customer"' })).toBeInTheDocument();
    });

    it("renders the user search combobox", () => {
        renderWithIntl(<UiTransferOwnershipDialogCard {...baseProps} />);
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("disables Transfer while no owner is picked", () => {
        renderWithIntl(<UiTransferOwnershipDialogCard {...baseProps} />);
        expect(screen.getByRole("button", { name: "Transfer" })).toBeDisabled();
    });

    it("enables Transfer and shows the picked owner once one is selected", () => {
        renderWithIntl(<UiTransferOwnershipDialogCard {...baseProps} selectedOwner={owner} />);
        expect(screen.getByRole("button", { name: "Transfer" })).toBeEnabled();
        expect(screen.getByText("Jane Good")).toBeInTheDocument();
    });

    it("shows the keep-access note when 'Also remove my access' is unchecked", () => {
        renderWithIntl(<UiTransferOwnershipDialogCard {...baseProps} selectedOwner={owner} />);
        expect(screen.getByText(/retain view access/)).toBeInTheDocument();
    });

    it("shows the lose-access note when 'Also remove my access' is checked", () => {
        renderWithIntl(
            <UiTransferOwnershipDialogCard {...baseProps} selectedOwner={owner} alsoRemoveMyAccess />,
        );
        expect(screen.getByText(/lose all access/)).toBeInTheDocument();
    });

    it("fires onAlsoRemoveMyAccessChange when the checkbox is toggled", () => {
        const onChange = vi.fn();
        renderWithIntl(
            <UiTransferOwnershipDialogCard
                {...baseProps}
                selectedOwner={owner}
                onAlsoRemoveMyAccessChange={onChange}
            />,
        );
        fireEvent.click(screen.getByLabelText("Also remove my access"));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("calls onBack, onClose, onCancel and onTransfer from their controls", () => {
        const onBack = vi.fn();
        const onClose = vi.fn();
        const onCancel = vi.fn();
        const onTransfer = vi.fn();
        renderWithIntl(
            <UiTransferOwnershipDialogCard
                {...baseProps}
                selectedOwner={owner}
                onBack={onBack}
                onClose={onClose}
                onCancel={onCancel}
                onTransfer={onTransfer}
            />,
        );
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        fireEvent.click(screen.getByRole("button", { name: "Transfer" }));
        expect(onBack).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onTransfer).toHaveBeenCalledTimes(1);
    });

    it("disables Transfer while a transfer is in flight", () => {
        renderWithIntl(<UiTransferOwnershipDialogCard {...baseProps} selectedOwner={owner} isSaving />);
        expect(screen.getByRole("button", { name: "Transfer" })).toBeDisabled();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiTransferOwnershipDialogCard {...baseProps} dataTestId="transfer-dialog" />);
        expect(screen.getByTestId("transfer-dialog")).toBeInTheDocument();
    });
});
