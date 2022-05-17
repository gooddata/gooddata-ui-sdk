// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { AttributeFilterItem } from "../AttributeFilterItem";

describe("AttributeFilterItem@next", () => {
    function renderComponent(props = {}) {
        return mount(<AttributeFilterItem {...props} />);
    }

    function createItem() {
        return {
            source: {
                title: "A",
                uri: "/gdc/md/projectId/obj/a",
            },
            selected: true,
            onSelect: jest.fn(),
        };
    }

    it("should render loading for no item", () => {
        const wrapper = renderComponent();
        expect(wrapper.find(".gd-list-item-not-loaded")).toHaveLength(1);
    });

    it("should render item", () => {
        const wrapper = renderComponent({
            item: createItem(),
        });
        expect(wrapper.find(".gd-input-checkbox")).toHaveLength(1);
        expect(wrapper.text()).toEqual("A");
    });

    it("should dispatch callback on checkbox change", () => {
        const item = createItem();

        const wrapper = renderComponent({
            item,
        });

        wrapper.find(".gd-list-item").simulate("click");
        expect(item.onSelect).toHaveBeenCalledTimes(1);
        expect(item.onSelect).toHaveBeenCalledWith(item.source);
    });
});
