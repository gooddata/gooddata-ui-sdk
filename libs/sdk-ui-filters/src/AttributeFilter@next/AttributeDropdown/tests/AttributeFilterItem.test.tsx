// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { AttributeFilterItem, IAttributeFilterItemProps } from "../AttributeFilterItem";

describe("AttributeFilterItem@next", () => {
    function renderComponent(item: IAttributeFilterItemProps = createEmptyItem()) {
        return mount(<AttributeFilterItem {...item} />);
    }

    function createItem(): IAttributeFilterItemProps {
        return {
            isSelected: true,
            item: {
                title: "A",
                uri: "/gdc/md/projectId/obj/a",
            },
            onSelect: jest.fn(),
            onSelectOnly: jest.fn(),
        };
    }

    function createEmptyItem(): IAttributeFilterItemProps {
        return {
            isSelected: true,
            item: {
                empty: true,
            },
            onSelect: jest.fn(),
            onSelectOnly: jest.fn(),
        };
    }

    it("should render loading for no item", () => {
        const wrapper = renderComponent();
        expect(wrapper.find(".gd-list-item-not-loaded")).toHaveLength(1);
    });

    it("should render item", () => {
        const item = createItem();

        const wrapper = renderComponent(item);
        expect(wrapper.find(".gd-input-checkbox")).toHaveLength(1);
        expect(wrapper.text()).toEqual("A");
    });

    it("should dispatch callback on checkbox change", () => {
        const item = createItem();

        const wrapper = renderComponent(item);

        wrapper.find(".gd-list-item").simulate("click");
        expect(item.onSelect).toHaveBeenCalledTimes(1);
        expect(item.onSelect).toHaveBeenCalledWith(item.item);
    });
});
