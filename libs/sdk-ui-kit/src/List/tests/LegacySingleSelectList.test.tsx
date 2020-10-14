// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { LegacySingleSelectList, ILegacySingleSelectListProps } from "../LegacySingleSelectList";

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
        return mount(
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
        onSelectStub = jest.fn();
    });

    it("should call onSelect when item clicked", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
            onSelect: onSelectStub,
        });

        wrapper.find(".gd-list-item").first().simulate("click");
        expect(onSelectStub).toHaveBeenCalledWith(firstItem);
    });

    it("should call onSelect with correct selection although some other selection exists", () => {
        const wrapper = renderList({
            items: [firstItem, secondItem],
            selection: secondItem,
            onSelect: onSelectStub,
        });

        wrapper.find(".gd-list-item").first().simulate("click");
        expect(onSelectStub).toHaveBeenCalledWith(firstItem);
    });
});
