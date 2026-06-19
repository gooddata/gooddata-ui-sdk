// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiLabelsChecklistItem, UiLabelsChecklist } from "../UiLabelsChecklist.js";

const ITEMS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];
const ALL_SELECTED = ["id", "name", "email", "ssn"];

const withIntl = (ui: ReactNode) => (
    <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
        {ui}
    </IntlProvider>
);

const renderWithIntl = (ui: ReactNode) => render(withIntl(ui));

const closeSpy = vi.fn();
const backSpy = vi.fn();

const renderChecklist = (props: Partial<Parameters<typeof UiLabelsChecklist>[0]>) => {
    closeSpy.mockClear();
    backSpy.mockClear();
    return renderWithIntl(
        <UiLabelsChecklist
            items={ITEMS}
            defaultSelectedIds={ALL_SELECTED}
            onApply={() => {}}
            onBack={backSpy}
            onClose={closeSpy}
            {...props}
        />,
    );
};

const rowCheckbox = (name: string) => screen.getByRole("checkbox", { name }) as HTMLInputElement;

describe("UiLabelsChecklist", () => {
    it("renders all items with the initial selection", () => {
        renderChecklist({ defaultSelectedIds: ALL_SELECTED });
        expect(rowCheckbox("Customer ID").checked).toBe(true);
        expect(rowCheckbox("Customer Name").checked).toBe(true);
        expect(rowCheckbox("Customer Email").checked).toBe(true);
        expect(rowCheckbox("Customer SSN").checked).toBe(true);
    });

    it("locks the primary row — it stays checked and disabled", () => {
        renderChecklist({ defaultSelectedIds: [] });
        const cb = rowCheckbox("Customer ID");
        expect(cb.checked).toBe(true);
        expect(cb.disabled).toBe(true);
    });

    it("Apply is disabled until something changes", () => {
        renderChecklist({ defaultSelectedIds: ALL_SELECTED });
        const applyButton = screen.getByRole("button", { name: "Apply" });
        expect(applyButton).toBeDisabled();

        fireEvent.click(rowCheckbox("Customer SSN"));
        expect(applyButton).toBeEnabled();
    });

    it("Apply commits the staged selection (locked items always included) and closes", () => {
        const onApply = vi.fn();
        renderChecklist({ defaultSelectedIds: ALL_SELECTED, onApply });
        fireEvent.click(rowCheckbox("Customer Email"));
        fireEvent.click(rowCheckbox("Customer SSN"));
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));
        expect(onApply).toHaveBeenCalledWith(["id", "name"]);
        expect(closeSpy).toHaveBeenCalledOnce();
    });

    it("Cancel closes without committing", () => {
        const onApply = vi.fn();
        renderChecklist({ defaultSelectedIds: ALL_SELECTED, onApply });
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onApply).not.toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalledOnce();
    });

    it("Back returns to the parent view without committing", () => {
        const onApply = vi.fn();
        renderChecklist({ defaultSelectedIds: ALL_SELECTED, onApply });
        fireEvent.click(screen.getByRole("button", { name: /back/i }));
        expect(onApply).not.toHaveBeenCalled();
        expect(backSpy).toHaveBeenCalledOnce();
        expect(closeSpy).not.toHaveBeenCalled();
    });

    it("auto-includes a newly-locked label when items change while staged edits exist", () => {
        const onApply = vi.fn();
        const initialItems: IUiLabelsChecklistItem[] = [
            { id: "id", label: "Customer ID", kind: "primary", locked: true },
            { id: "name", label: "Customer Name", kind: "default" },
            { id: "email", label: "Customer Email" },
        ];
        const { rerender } = renderWithIntl(
            <UiLabelsChecklist
                items={initialItems}
                defaultSelectedIds={["id", "name", "email"]}
                onApply={onApply}
                onBack={backSpy}
                onClose={closeSpy}
            />,
        );

        // Stage an edit: uncheck Customer Name.
        fireEvent.click(rowCheckbox("Customer Name"));
        expect(rowCheckbox("Customer Name").checked).toBe(false);

        // A new label arrives and is locked (e.g. metadata caught up).
        const updatedItems: IUiLabelsChecklistItem[] = [
            ...initialItems,
            { id: "ssn", label: "Customer SSN", locked: true },
        ];
        rerender(
            withIntl(
                <UiLabelsChecklist
                    items={updatedItems}
                    defaultSelectedIds={["id", "name", "email"]}
                    onApply={onApply}
                    onBack={backSpy}
                    onClose={closeSpy}
                />,
            ),
        );

        // The newly-locked label is checked + disabled, and the staged edit
        // (Customer Name unchecked) is preserved.
        expect(rowCheckbox("Customer SSN").checked).toBe(true);
        expect(rowCheckbox("Customer SSN").disabled).toBe(true);
        expect(rowCheckbox("Customer Name").checked).toBe(false);
    });
});
