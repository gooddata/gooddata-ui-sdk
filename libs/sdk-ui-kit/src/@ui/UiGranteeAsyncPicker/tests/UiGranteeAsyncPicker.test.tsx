// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiGranteeAsyncOptions, UiGranteeAsyncPicker } from "../UiGranteeAsyncPicker.js";

const SAMPLE: IUiGranteeAsyncOptions = {
    groups: [
        { id: "g1", kind: "group", name: "Marketing" },
        { id: "g2", kind: "group", name: "Engineering" },
    ],
    users: [
        { id: "u1", kind: "user", name: "Jane Good", email: "jane@example.com" },
        { id: "u2", kind: "user", name: "Marek", email: "marek@example.com" },
    ],
};

function renderWithIntl(ui: React.ReactNode) {
    return render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );
}

describe("UiGranteeAsyncPicker", () => {
    it("renders the search input", () => {
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve({ groups: [], users: [] })}
                onSelect={() => {}}
            />,
        );
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders the sectioned dropdown on click", async () => {
        renderWithIntl(
            <UiGranteeAsyncPicker loadOptions={() => Promise.resolve(SAMPLE)} onSelect={() => {}} />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("Marketing")).toBeInTheDocument());
        expect(screen.getByText("Groups")).toBeInTheDocument();
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByText("Jane Good")).toBeInTheDocument();
    });

    it("emits onSelect with the underlying grantee when an option is clicked", async () => {
        const onSelect = vi.fn();
        renderWithIntl(
            <UiGranteeAsyncPicker loadOptions={() => Promise.resolve(SAMPLE)} onSelect={onSelect} />,
        );
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("Jane Good")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Jane Good"));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls[0][0].id).toBe("u1");
    });

    it("filters out already-selected grantees and renders them with a permission menu trigger", async () => {
        renderWithIntl(
            <UiGranteeAsyncPicker
                loadOptions={() => Promise.resolve(SAMPLE)}
                onSelect={() => {}}
                selectedGrantees={[
                    {
                        id: "u1",
                        kind: "user",
                        name: "Jane Good",
                        email: "jane@example.com",
                        permissionLevel: "VIEW",
                    },
                ]}
            />,
        );
        // Jane is rendered in the picked list with a permission menu trigger.
        expect(screen.getByText("Jane Good")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /can view/i })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByText("Marek")).toBeInTheDocument());
        const dropdownOptions = screen.getAllByRole("option").map((el) => el.textContent);
        expect(dropdownOptions.some((t) => t?.includes("Marek"))).toBe(true);
        expect(dropdownOptions.some((t) => t?.includes("Jane Good"))).toBe(false);
    });
});
