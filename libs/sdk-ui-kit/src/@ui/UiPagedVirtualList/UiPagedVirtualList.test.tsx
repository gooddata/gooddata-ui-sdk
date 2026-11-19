// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

    it("adds the list padding above the first item and below the last item", () => {
        render(
            <UiPagedVirtualList
                maxHeight={500}
                items={items}
                itemHeight={20}
                itemsGap={0}
                itemPadding={0}
                listPadding={10}
                skeletonItemsCount={0}
                representAs="list"
            >
                {(item) => <span>{item}</span>}
            </UiPagedVirtualList>,
        );
        const list = screen.getByRole("list");

        expect(list.parentElement).toHaveStyle({ height: "80px" });
        expect(list).toHaveStyle({ height: "80px" });
        expect(screen.getAllByRole("listitem")[0]).toHaveStyle({ transform: "translateY(10px)" });
    });

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
        <div role="grid" tabIndex={0} aria-activedescendant="row-49">
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
                listboxProps={{ "aria-activedescendant": "row-49", "aria-busy": false }}
            >
                {(item, index) => (
                    <div role="row" id={`row-${index}`}>
                        {item}
                    </div>
                )}
            </UiPagedVirtualList>
        </div>,
    );
    const grid = screen.getByRole("grid");
    const rowgroup = screen.getByRole("rowgroup");
    const activeRow = document.getElementById(grid.getAttribute("aria-activedescendant") ?? "");
    expect(activeRow).toBe(screen.getByText("Row 49"));
    expect(grid.contains(activeRow)).toBe(true);
    expect([...grid.querySelectorAll("[tabindex]")].map((element) => element.getAttribute("role"))).toEqual([
        "rowgroup",
    ]);
    expect(rowgroup).toHaveAttribute("tabindex", "-1");
    expect(rowgroup).toHaveAttribute("aria-busy", "false");
    expect(rowgroup).not.toHaveAttribute("aria-activedescendant");
});

it("loads the next grid page when scrolling near the end, even with the last row already pinned", () => {
    const loadNextPage = vi.fn();

    render(
        <UiPagedVirtualList
            maxHeight={100}
            items={manyItems}
            focusedItem={manyItems.at(-1)}
            itemHeight={20}
            itemsGap={0}
            itemPadding={0}
            skeletonItemsCount={0}
            tabIndex={-1}
            representAs="grid"
            hasNextPage
            loadNextPage={loadNextPage}
        >
            {(item) => <div role="row">{item}</div>}
        </UiPagedVirtualList>,
    );

    expect(screen.getByText("Row 49")).toBeInTheDocument();
    expect(loadNextPage).not.toHaveBeenCalled();

    fireEvent.scroll(screen.getByRole("rowgroup"), { target: { scrollTop: 900 } });

    expect(loadNextPage).toHaveBeenCalledOnce();
});
