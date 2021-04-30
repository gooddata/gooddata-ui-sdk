// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { LegacyListItem } from "../LegacyListItem";

describe("LegacyListItem", () => {
    const dummyListItemRenderer = (props: any) => {
        const title = props?.source?.title ?? "";
        return <div>{title}</div>;
    };

    const renderListItem = (customProps = {}) => {
        const props = {
            listItemClass: dummyListItemRenderer,
            ...customProps,
        };
        return mount(<LegacyListItem {...props} />);
    };

    it("should render empty list item if item prop is not defined", () => {
        const wrapper = renderListItem();

        expect(wrapper.html()).toEqual("<div></div>");
    });

    it("should render list item if item prop is defined", () => {
        const wrapper = renderListItem({
            item: {
                source: {
                    title: "Hello world!",
                },
            },
        });

        expect(wrapper.html()).toEqual("<div>Hello world!</div>");
    });

    it("should render separator if item type is 'separator'", () => {
        const wrapper = renderListItem({
            item: {
                source: {
                    title: "Hello world!",
                    type: "separator",
                },
            },
        });

        expect(wrapper.html()).toEqual('<div class="gd-list-item gd-list-item-separator"></div>');
    });

    it("should render header if item type is 'header'", () => {
        const headerTitle = "I am header";
        const wrapper = renderListItem({
            item: {
                source: {
                    title: headerTitle,
                    type: "header",
                },
            },
        });

        expect(wrapper.html()).toEqual(`<div class="gd-list-item gd-list-item-header">${headerTitle}</div>`);
    });

    it("should render header if item type is 'header' and no title is provided", () => {
        const wrapper = renderListItem({
            item: {
                source: {
                    type: "header",
                },
            },
        });

        expect(wrapper.html()).toEqual('<div class="gd-list-item gd-list-item-header"></div>');
    });
});
