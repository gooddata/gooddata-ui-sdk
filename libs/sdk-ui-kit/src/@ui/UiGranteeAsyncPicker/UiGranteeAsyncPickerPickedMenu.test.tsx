// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiLabelsChecklistItem } from "../UiLabelsChecklist/UiLabelsChecklist.js";

import { type IUiPickedGrantee, UiGranteeAsyncPicker } from "./UiGranteeAsyncPicker.js";

const JANE: IUiPickedGrantee = {
    id: "u1",
    ref: idRef("u1"),
    kind: "user",
    name: "Jane Good",
    email: "jane@example.com",
    permissionLevel: "VIEW",
};

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "lbl.primary", label: "Country", kind: "primary", locked: true },
    { id: "lbl.name", label: "Name" },
    { id: "lbl.email", label: "Email" },
];

function renderWithIntl(ui: ReactNode) {
    return render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );
}

// JANE has VIEW, so the picked row's permission trigger reads "Can view".
const openPickedMenu = () => fireEvent.click(screen.getByRole("button", { name: /^Can view$/ }));

describe("UiGranteeAsyncPicker picked-row menu", () => {
    it("offers Remove access in the picked row's permission menu and fires onRemove with the grantee", () => {
        const onRemove = vi.fn();
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve({ groups: [], users: [] })}
                onSelect={() => {}}
                onRemove={onRemove}
                selectedGrantees={[JANE]}
            />,
        );
        openPickedMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /remove access/i }));
        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(onRemove.mock.calls[0][0].id).toBe("u1");
    });

    it("does not render a standalone remove (✕) button — removal lives in the menu", () => {
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve({ groups: [], users: [] })}
                onSelect={() => {}}
                onRemove={() => {}}
                selectedGrantees={[JANE]}
            />,
        );
        openPickedMenu();
        // The only Remove affordance is the menu item, not a separate icon button.
        expect(screen.queryByRole("button", { name: /remove access/i })).not.toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /remove access/i })).toBeInTheDocument();
    });

    it("omits Remove access from the menu when onRemove is not provided", () => {
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve({ groups: [], users: [] })}
                onSelect={() => {}}
                selectedGrantees={[JANE]}
            />,
        );
        openPickedMenu();
        expect(screen.queryByRole("menuitem", { name: /remove access/i })).not.toBeInTheDocument();
    });

    it("offers no label drill-in when no labels are passed", () => {
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve({ groups: [], users: [] })}
                onSelect={() => {}}
                selectedGrantees={[JANE]}
            />,
        );
        openPickedMenu();
        expect(screen.queryByRole("menuitem", { name: /label access/i })).not.toBeInTheDocument();
    });

    it("scopes a picked grantee's labels before the grant, reporting the applied selection", () => {
        const onLabelsChange = vi.fn();
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve({ groups: [], users: [] })}
                onSelect={() => {}}
                selectedGrantees={[JANE]}
                labels={LABELS}
                onLabelsChange={onLabelsChange}
            />,
        );
        openPickedMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));

        // No scope of its own means every label, so all three start checked.
        const email = screen.getByRole("checkbox", { name: /Email/ });
        expect(email).toBeChecked();
        fireEvent.click(email);
        fireEvent.click(screen.getByRole("button", { name: "Apply" }));

        expect(onLabelsChange).toHaveBeenCalledTimes(1);
        expect(onLabelsChange.mock.calls[0][0].id).toBe("u1");
        expect([...onLabelsChange.mock.calls[0][1]].sort()).toEqual(["lbl.name", "lbl.primary"]);
    });

    it("renders the grantee's own label scope, keeping the primary label locked in", () => {
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve({ groups: [], users: [] })}
                onSelect={() => {}}
                selectedGrantees={[{ ...JANE, labelIds: ["lbl.email"] }]}
                labels={LABELS}
                onLabelsChange={() => {}}
            />,
        );
        openPickedMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: /label access/i }));

        expect(screen.getByRole("checkbox", { name: /Email/ })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: /Name/ })).not.toBeChecked();
        // Locked regardless of the scope — the primary label can never be dropped.
        const primary = screen.getByRole("checkbox", { name: /Country/ });
        expect(primary).toBeChecked();
        expect(primary).toBeDisabled();
    });
});
