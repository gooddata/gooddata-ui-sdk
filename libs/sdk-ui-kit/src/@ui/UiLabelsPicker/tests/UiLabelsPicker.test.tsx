// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// UiPopover transitively imports the legacy Bubble stack which fails to
// resolve prop-types under our pnpm hoist. Mock with a minimal anchor +
// always-open content shell — the popover behaviour itself is verified in
// Storybook, here we test the picker body's staging / apply / cancel logic.
vi.mock("../../UiPopover/UiPopover.js", () => ({
    UiPopover: ({ content }: { content: (args: { onClose: () => void }) => React.ReactNode }) => (
        <div data-testid="popover-shell">{content({ onClose: closeSpy })}</div>
    ),
}));

const closeSpy = vi.fn();

import { type IUiLabelsPickerItem, UiLabelsPicker } from "../UiLabelsPicker.js";

const ITEMS: IUiLabelsPickerItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

const ALL_SELECTED = ["id", "name", "email", "ssn"];

const withIntl = (ui: React.ReactNode) => (
    <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
        {ui}
    </IntlProvider>
);

const renderWithIntl = (ui: React.ReactNode) => render(withIntl(ui));

const rowCheckbox = (label: string): HTMLInputElement => {
    // Find the row via its visible label text, then the checkbox inside.
    const row = screen.getByText(label).closest(".gd-ui-kit-label-row");
    if (!(row instanceof HTMLElement)) throw new Error(`row "${label}" not found`);
    const checkbox = within(row).getByRole("checkbox");
    if (!(checkbox instanceof HTMLInputElement)) throw new Error(`checkbox for "${label}" not found`);
    return checkbox;
};

const renderPicker = (props: Partial<Parameters<typeof UiLabelsPicker>[0]>) => {
    closeSpy.mockClear();
    return renderWithIntl(
        <UiLabelsPicker
            anchor={<button>open</button>}
            items={ITEMS}
            defaultSelectedIds={ALL_SELECTED}
            onApply={() => {}}
            {...props}
        />,
    );
};

describe("UiLabelsPicker", () => {
    it("renders all items with the initial selection", () => {
        renderPicker({ defaultSelectedIds: ALL_SELECTED });
        expect(rowCheckbox("Customer ID").checked).toBe(true);
        expect(rowCheckbox("Customer Name").checked).toBe(true);
        expect(rowCheckbox("Customer Email").checked).toBe(true);
        expect(rowCheckbox("Customer SSN").checked).toBe(true);
    });

    it("locks the primary row — it stays checked and disabled", () => {
        renderPicker({ defaultSelectedIds: [] });
        const cb = rowCheckbox("Customer ID");
        expect(cb.checked).toBe(true);
        expect(cb.disabled).toBe(true);
    });

    it("Apply is disabled until something changes", () => {
        renderPicker({ defaultSelectedIds: ALL_SELECTED });
        const applyButton = screen.getByRole("button", { name: "Apply" });
        expect(applyButton).toBeDisabled();

        fireEvent.click(rowCheckbox("Customer SSN"));
        expect(applyButton).toBeEnabled();
    });

    it("Apply commits the staged selection (locked items always included) and closes the popover", () => {
        const onApply = vi.fn();
        renderPicker({ defaultSelectedIds: ALL_SELECTED, onApply });
        fireEvent.click(rowCheckbox("Customer Email"));
        fireEvent.click(rowCheckbox("Customer SSN"));
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        expect(onApply).toHaveBeenCalledWith(["id", "name"]);
        expect(closeSpy).toHaveBeenCalledOnce();
    });

    it("keeps staged changes when parent rerenders with an equivalent default selection", () => {
        const onApply = vi.fn();
        const { rerender } = renderPicker({ defaultSelectedIds: ALL_SELECTED, onApply });

        fireEvent.click(rowCheckbox("Customer SSN"));
        expect(rowCheckbox("Customer SSN").checked).toBe(false);

        rerender(
            withIntl(
                <UiLabelsPicker
                    anchor={<button>open</button>}
                    items={ITEMS}
                    defaultSelectedIds={[...ALL_SELECTED]}
                    onApply={onApply}
                />,
            ),
        );

        expect(rowCheckbox("Customer SSN").checked).toBe(false);
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        expect(onApply).toHaveBeenCalledWith(["id", "name", "email"]);
    });

    it("auto-includes a newly-locked label when items change while staged edits exist", () => {
        // When label metadata arrives after open (or a label flips to locked) but
        // defaultSelectedIds stays the same, the new locked id must be merged
        // into the current selection without wiping the user's staged edits —
        // the component contract is "locked items are always included".
        const onApply = vi.fn();
        const initialItems: IUiLabelsPickerItem[] = [
            { id: "id", label: "Customer ID", kind: "primary", locked: true },
            { id: "name", label: "Customer Name", kind: "default" },
            { id: "email", label: "Customer Email" },
        ];
        const { rerender } = renderWithIntl(
            <UiLabelsPicker
                anchor={<button>open</button>}
                items={initialItems}
                defaultSelectedIds={["id", "name", "email"]}
                onApply={onApply}
            />,
        );

        // Stage an edit: uncheck Customer Name.
        fireEvent.click(rowCheckbox("Customer Name"));
        expect(rowCheckbox("Customer Name").checked).toBe(false);

        // A new label arrives and is locked (e.g. metadata caught up).
        const updatedItems: IUiLabelsPickerItem[] = [
            ...initialItems,
            { id: "ssn", label: "Customer SSN", locked: true },
        ];
        rerender(
            withIntl(
                <UiLabelsPicker
                    anchor={<button>open</button>}
                    items={updatedItems}
                    defaultSelectedIds={["id", "name", "email"]}
                    onApply={onApply}
                />,
            ),
        );

        // The newly-locked label is now checked and disabled, and the staged
        // edit (Customer Name unchecked) is preserved.
        expect(rowCheckbox("Customer SSN").checked).toBe(true);
        expect(rowCheckbox("Customer SSN").disabled).toBe(true);
        expect(rowCheckbox("Customer Name").checked).toBe(false);

        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        expect(onApply).toHaveBeenCalledWith(["id", "email", "ssn"]);
    });

    it("Cancel does not call onApply and closes the popover", () => {
        const onApply = vi.fn();
        renderPicker({ defaultSelectedIds: ALL_SELECTED, onApply });
        fireEvent.click(rowCheckbox("Customer Email"));
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onApply).not.toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalledOnce();
    });
});
