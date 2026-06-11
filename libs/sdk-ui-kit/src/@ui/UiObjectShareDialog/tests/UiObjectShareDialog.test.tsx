// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiTag (and indirectly UiTooltip) pulls the legacy Bubble stack which fails
// under our pnpm hoist — mock it. The dialog wiring is what we cover here.
vi.mock("../../UiTooltip/UiTooltip.js", () => ({
    UiTooltip: ({ anchor }: { anchor: React.ReactNode }) => <>{anchor}</>,
}));

import { UiObjectShareDialog } from "../UiObjectShareDialog.js";
import { type IUiObjectShareDialogGrantee } from "../UiObjectShareDialogCard.js";

const GRANTEES: IUiObjectShareDialogGrantee[] = [
    { id: "owner", kind: "user", name: "Marek Stránský", email: "marek@example.com", isOwner: true },
];

const baseProps = {
    objectTitle: "Customer",
    onClose: () => {},
    grantees: GRANTEES,
    onAddClick: () => {},
    generalAccess: "RESTRICTED" as const,
    onGeneralAccessChange: () => {},
};

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiObjectShareDialog", () => {
    it("does not render when isOpen is false", () => {
        renderWithIntl(<UiObjectShareDialog {...baseProps} isOpen={false} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders the card when open", () => {
        renderWithIntl(<UiObjectShareDialog {...baseProps} isOpen />);
        expect(screen.getByText("Marek Stránský")).toBeInTheDocument();
    });

    it("calls onClose when Escape is pressed inside the dialog", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiObjectShareDialog {...baseProps} isOpen onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
