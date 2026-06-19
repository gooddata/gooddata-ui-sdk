// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiPopover pulls in the legacy Bubble stack that fails under our pnpm hoist.
// Mock it with a shell that always renders the content — popover open/close is
// verified visually in Storybook; here we only test the menu wiring.
vi.mock("../../UiPopover/UiPopover.js", () => ({
    UiPopover: ({ content }: { content: (args: { onClose: () => void }) => ReactNode }) => (
        <div data-testid="popover-shell">{content({ onClose: closeSpy })}</div>
    ),
}));

const closeSpy = vi.fn();

import { type IUiLabelsChecklistItem } from "../../UiLabelsChecklist/UiLabelsChecklist.js";
import { UiMoreOptionsMenu } from "../UiMoreOptionsMenu.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
];

const renderWithIntl = (ui: ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const renderMenu = (props: Partial<Parameters<typeof UiMoreOptionsMenu>[0]> = {}) => {
    closeSpy.mockClear();
    return renderWithIntl(<UiMoreOptionsMenu {...props} />);
};

describe("UiMoreOptionsMenu", () => {
    it("shows Manage labels access when labels are provided", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id", "name", "email"] });
        expect(screen.getByRole("menuitem", { name: /labels access/i })).toBeInTheDocument();
    });

    it("drills into the label checklist when Manage labels access is picked", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id", "name", "email"] });
        // Checklist rows are not present in the list view.
        expect(screen.queryByRole("checkbox", { name: /Customer Email/ })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        // Now the checklist body is rendered (drilled in, same popover).
        expect(screen.getByRole("checkbox", { name: /Customer Email/ })).toBeInTheDocument();
    });

    it("commits the locked-augmented selection via onLabelsChange on Apply", () => {
        const onLabelsChange = vi.fn();
        renderMenu({ labels: LABELS, selectedLabelIds: ["id", "name", "email"], onLabelsChange });
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Customer Email/ }));
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        // Locked "id" stays, "name" stays, "email" removed.
        expect(onLabelsChange).toHaveBeenCalledWith(["id", "name"]);
        expect(closeSpy).toHaveBeenCalledOnce();
    });

    it("keeps staged checkbox edits when the parent re-renders while the checklist is open", () => {
        // Regression: a parent re-render must not remount the checklist (which would drop staged edits).
        const { rerender } = renderWithIntl(
            <UiMoreOptionsMenu
                labels={LABELS}
                selectedLabelIds={["id", "name", "email"]}
                onLabelsChange={() => {}}
            />,
        );
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Customer Email/ }));
        expect((screen.getByRole("checkbox", { name: /Customer Email/ }) as HTMLInputElement).checked).toBe(
            false,
        );

        // Parent re-renders with brand-new references — must NOT remount the checklist.
        rerender(
            <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
                <UiMoreOptionsMenu
                    labels={[...LABELS]}
                    selectedLabelIds={["id", "name", "email"]}
                    onLabelsChange={() => {}}
                />
            </IntlProvider>,
        );

        // Still drilled in, and the staged uncheck persisted.
        const email = screen.getByRole("checkbox", { name: /Customer Email/ }) as HTMLInputElement;
        expect(email.checked).toBe(false);
    });

    it("returns to the menu list when Back is pressed in the checklist", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id"], onTransferOwnership: () => {} });
        fireEvent.click(screen.getByRole("menuitem", { name: /labels access/i }));
        expect(screen.getByRole("checkbox", { name: /Customer Email/ })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /back/i }));
        // Back to the list: checklist gone, the menu rows visible again.
        expect(screen.queryByRole("checkbox", { name: /Customer Email/ })).not.toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /labels access/i })).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /Transfer ownership/ })).toBeInTheDocument();
    });

    it("shows Transfer ownership and fires it (closing the menu) when picked", () => {
        const onTransferOwnership = vi.fn();
        renderMenu({ onTransferOwnership });
        fireEvent.click(screen.getByRole("menuitem", { name: /Transfer ownership/ }));
        expect(onTransferOwnership).toHaveBeenCalledOnce();
        expect(closeSpy).toHaveBeenCalledOnce();
    });

    it("omits Manage labels access when no labels are provided", () => {
        renderMenu({ onTransferOwnership: () => {} });
        expect(screen.queryByRole("menuitem", { name: /labels access/i })).not.toBeInTheDocument();
    });

    it("omits Transfer ownership when no handler is provided", () => {
        renderMenu({ labels: LABELS, selectedLabelIds: ["id"] });
        expect(screen.queryByRole("menuitem", { name: /Transfer ownership/ })).not.toBeInTheDocument();
    });

    it("forwards dataTestId", () => {
        renderMenu({ dataTestId: "more-menu", labels: LABELS, selectedLabelIds: ["id"] });
        expect(screen.getByTestId("more-menu")).toBeInTheDocument();
    });
});
