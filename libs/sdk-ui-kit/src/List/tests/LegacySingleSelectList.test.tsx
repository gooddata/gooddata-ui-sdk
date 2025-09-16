// (C) 2007-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ILegacySingleSelectListProps, LegacySingleSelectList } from "../LegacySingleSelectList.js";

interface IItem {
    title: string;
}

describe("LegacySingleSelectList", () => {
    let onSelectStub: () => void;
    const firstItem: IItem = {
        title: "First item",
    };

    const secondItem: IItem = {
        title: "Second item",
    };

    function renderList(options: Partial<ILegacySingleSelectListProps<IItem>> = {}) {
        return render(
            <LegacySingleSelectList
                items={options.items}
                itemsCount={options.items.length}
                selection={options.selection}
                width={100}
                height={100}
                itemHeight={10}
                onSelect={options.onSelect}
            />,
        );
    }

    beforeEach(() => {
        onSelectStub = vi.fn();
    });

    it("should call onSelect when item clicked", async () => {
        renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        await userEvent.click(screen.getByText(firstItem.title));
        expect(onSelectStub).toHaveBeenCalledWith(firstItem);
    });

    it("should call onSelect with correct selection although some other selection exists", async () => {
        renderList({
            items: [firstItem, secondItem],
            selection: secondItem,
            onSelect: onSelectStub,
        });

        await userEvent.click(screen.getByText(firstItem.title));

        expect(onSelectStub).toHaveBeenCalledWith(firstItem);
    });
});
