// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiAddGranteeDialog } from "../UiAddGranteeDialog.js";

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

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiAddGranteeDialog", () => {
    it("does not render when isOpen is false", () => {
        renderWithIntl(<UiAddGranteeDialog {...baseProps} isOpen={false} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders the card when open", () => {
        renderWithIntl(<UiAddGranteeDialog {...baseProps} isOpen />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("calls onClose when Escape is pressed inside the dialog", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiAddGranteeDialog {...baseProps} isOpen onClose={onClose} />);
        // UiModalDialog handles Escape locally on the card (not a document
        // listener), so fire it from within the dialog.
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
