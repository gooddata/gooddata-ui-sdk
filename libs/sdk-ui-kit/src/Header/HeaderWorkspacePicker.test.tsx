// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { HeaderWorkspacePicker, type IHeaderWorkspace } from "./HeaderWorkspacePicker.js";

const workspaces: IHeaderWorkspace[] = [
    { id: "ws1", title: "KD dashboards", description: "" },
    { id: "ws2", title: "KD sales", description: "" },
    { id: "ws3", title: "KD finance", description: "" },
];

const Wrapped = withIntlForTest(HeaderWorkspacePicker);

const renderPicker = (onSelect = vi.fn()) => {
    render(
        <Wrapped
            workspaces={workspaces}
            totalWorkspacesCount={workspaces.length}
            selectedWorkspace={workspaces[2]}
            showSearch
            onSelect={onSelect}
        />,
    );
    return onSelect;
};

const openPicker = async () => {
    await userEvent.click(screen.getByRole("button", { name: "KD finance" }));
    const combobox = await screen.findByRole("combobox", { name: "Search workspaces" });
    // the autofocus waits for a visible overlay, which jsdom never reports
    combobox.focus();
    return combobox;
};

describe("HeaderWorkspacePicker", () => {
    it("exposes the search input as a combobox controlling the workspaces listbox", async () => {
        renderPicker();
        const combobox = await openPicker();
        const listbox = screen.getByRole("listbox", { name: "Workspaces" });

        expect(combobox).toHaveAttribute("aria-expanded", "true");
        expect(combobox).toHaveAttribute("aria-autocomplete", "list");
        expect(combobox).toHaveAttribute("aria-controls", listbox.id);
        expect(combobox).not.toHaveAttribute("aria-activedescendant");
        expect(listbox).toHaveAttribute("tabindex", "-1");

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);
        expect(new Set(options.map((option) => option.id)).size).toBe(3);
        expect(options[0]).toHaveAccessibleName("KD dashboards");
        expect(options[2]).toHaveAttribute("aria-selected", "true");
    });

    it("moves the active option with the arrow keys and selects it with Enter", async () => {
        const onSelect = renderPicker();
        const combobox = await openPicker();

        await userEvent.keyboard("{ArrowDown}");
        expect(combobox).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[0].id);

        await userEvent.keyboard("{ArrowDown}");
        expect(combobox).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[1].id);

        await userEvent.keyboard("{ArrowUp}{ArrowUp}");
        expect(combobox).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[2].id);

        await userEvent.keyboard("{Enter}");
        expect(onSelect).toHaveBeenCalledWith(workspaces[2]);
    });

    it("clears a typed filter on the first Escape and closes the picker on the next one", async () => {
        renderPicker();
        const combobox = await openPicker();

        // the input recognizes Escape by its keyCode, which user-event does not set
        const pressEscape = () =>
            fireEvent.keyDown(document.activeElement!, { key: "Escape", keyCode: 27, which: 27 });

        await userEvent.keyboard("KD");
        pressEscape();
        expect(combobox).toHaveValue("");
        expect(combobox).toBeInTheDocument();

        pressEscape();
        await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeInTheDocument());
    });
});
