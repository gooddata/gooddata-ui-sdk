// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

// The real UiPopover pulls in the legacy Bubble stack that fails under our pnpm
// hoist. Mock it with a shell that always renders the anchor and its content so
// the picked-row permission menu rows are immediately clickable. Kept in its own
// file so the main picker test can exercise the real autocomplete dropdown.
type PopoverArgs = { onClose: () => void };
type PopoverMockProps = {
    anchor: ReactElement;
    content?: ReactNode | ((args: PopoverArgs) => ReactNode);
};
vi.mock("../../UiPopover/UiPopover.js", () => ({
    UiPopover: ({ anchor, content }: PopoverMockProps) => (
        <>
            {anchor}
            {typeof content === "function"
                ? (content as (args: PopoverArgs) => ReactNode)({ onClose: () => {} })
                : content}
        </>
    ),
}));

import { type IUiPickedGrantee, UiGranteeAsyncPicker } from "../UiGranteeAsyncPicker.js";

const JANE: IUiPickedGrantee = {
    id: "u1",
    kind: "user",
    name: "Jane Good",
    email: "jane@example.com",
    permissionLevel: "VIEW",
};

function renderWithIntl(ui: ReactNode) {
    return render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );
}

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
        expect(screen.queryByRole("menuitem", { name: /remove access/i })).not.toBeInTheDocument();
    });
});
