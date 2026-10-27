// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScopedIdStore, useScopedIdStoreValue } from "../hooks/useScopedId.js";

import { type IUiPagedVirtualListProps, UiPagedVirtualList } from "./UiPagedVirtualList.js";

const items = ["Item 1", "Item 2", "Item 3"];

const manyItems = Array.from({ length: 50 }, (_, index) => `Row ${index}`);

const identity = (item: string) => item;

function Listbox({
    listboxProps,
    listItems = items,
}: {
    listboxProps?: IUiPagedVirtualListProps<string>["listboxProps"];
    listItems?: string[];
}) {
    const scopedIdStoreValue = useScopedIdStoreValue(identity);

    return (
        <ScopedIdStore value={scopedIdStoreValue}>
            <UiPagedVirtualList<string>
                maxHeight={100}
                items={listItems}
                itemHeight={20}
                itemsGap={0}
                itemPadding={0}
                skeletonItemsCount={0}
                representAs="listbox"
                listboxProps={{ "aria-label": "Items", ...listboxProps }}
            >
                {(item) => <div>{item}</div>}
            </UiPagedVirtualList>
        </ScopedIdStore>
    );
}

describe("UiPagedVirtualList", () => {
    it.each(["list", "listbox", "grid"] as const)(
        "does not suppress native scroll-container focus for a standalone %s",
        (representAs) => {
            render(
                <UiPagedVirtualList
                    maxHeight={100}
                    items={manyItems}
                    itemHeight={20}
                    itemsGap={0}
                    itemPadding={0}
                    skeletonItemsCount={0}
                    representAs={representAs}
                >
                    {(item) => <span>{item}</span>}
                </UiPagedVirtualList>,
            );
            const list = screen.getByRole(representAs === "grid" ? "rowgroup" : representAs);
            expect(list.parentElement).not.toHaveAttribute("tabindex");
            expect(list.getAttribute("tabindex")).toBe(representAs === "list" ? null : "0");
        },
    );

    it("points aria-activedescendant at the keyboard-active option and moves it with the arrows", () => {
        render(<Listbox />);

        const listbox = screen.getByRole("listbox");
        const optionIds = () => screen.getAllByRole("option").map((option) => option.id);

        expect(optionIds()[0]).toMatch(/-selectItem$/);
        expect(listbox).toHaveAttribute("aria-activedescendant", optionIds()[0]);

        fireEvent.keyDown(listbox, { code: "ArrowDown" });
        expect(listbox).toHaveAttribute("aria-activedescendant", optionIds()[1]);

        fireEvent.keyDown(listbox, { code: "ArrowUp" });
        expect(listbox).toHaveAttribute("aria-activedescendant", optionIds()[0]);
    });

    it("leaves aria-activedescendant out while the active row is outside the virtual window", () => {
        render(<Listbox listItems={manyItems} />);

        const listbox = screen.getByRole("listbox");

        fireEvent.keyDown(listbox, { code: "End" });

        expect(screen.queryByText(manyItems.at(-1)!)).not.toBeInTheDocument();
        expect(listbox).not.toHaveAttribute("aria-activedescendant");
    });

    it("lets a consumer that drives the active option itself set the attribute, or clear it", () => {
        const { unmount } = render(<Listbox listboxProps={{ "aria-activedescendant": "consumer-option" }} />);

        expect(screen.getByRole("listbox")).toHaveAttribute("aria-activedescendant", "consumer-option");
        unmount();

        render(<Listbox listboxProps={{ "aria-activedescendant": undefined }} />);

        expect(screen.getByRole("listbox")).not.toHaveAttribute("aria-activedescendant");
    });
});

it("keeps a parent-managed active row mounted outside the virtual window", () => {
    render(
        <UiPagedVirtualList
            maxHeight={100}
            items={manyItems}
            itemHeight={20}
            itemsGap={0}
            itemPadding={0}
            skeletonItemsCount={0}
            tabIndex={-1}
            focusedItem={manyItems[49]}
            representAs="grid"
        >
            {(item) => <div role="row">{item}</div>}
        </UiPagedVirtualList>,
    );
    const rowgroup = screen.getByRole("rowgroup");
    expect(screen.getByText("Row 49")).toBeInTheDocument();
    expect(rowgroup).toHaveAttribute("tabindex", "-1");
    expect(rowgroup).not.toHaveAttribute("aria-activedescendant");
    expect(rowgroup.parentElement).toHaveAttribute("tabindex", "-1");
});
