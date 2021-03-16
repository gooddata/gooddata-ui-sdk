// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { withIntl } from "@gooddata/sdk-ui";

import { FilterLabel } from "../FilterLabel";
import { IFilterLabelProps } from "../typings";

const customMessages = {
    "gs.filterLabel.none": "None",
    "gs.filterLabel.all": "All",
};

function renderFilterLabel(options: IFilterLabelProps) {
    const Wrapped = withIntl(FilterLabel, "en-US", customMessages);
    return mount(<Wrapped {...options} />);
}

describe("FilterLabel", () => {
    it("should render filter label title", () => {
        const title = "Attribute";
        const wrapper = renderFilterLabel({
            title,
            selectionSize: 100,
        });

        expect(wrapper.find(".s-attribute-filter-label").text()).toEqual(title);
    });

    it("should render filter label title as well", () => {
        const title = "Attribute";
        const wrapper = renderFilterLabel({
            title,
            isAllSelected: true,
            selectionSize: 100,
            noData: true,
        });

        expect(wrapper.find(".s-attribute-filter-label").text()).toEqual(title);
    });

    it("should render filter label title and selection", () => {
        const title = "Attribute";
        const selection = "A, B, C";
        const wrapper = renderFilterLabel({
            title,
            selection,
            selectionSize: 100,
        });

        const expectedText = `${title}: ${selection}`;
        expect(wrapper.find(".s-attribute-filter-label").text()).toEqual(expectedText);
    });

    it("should render filter label title and All", () => {
        const title = "Attribute";
        const wrapper = renderFilterLabel({
            title,
            isAllSelected: true,
            selectionSize: 100,
        });

        const text = wrapper.find(".s-attribute-filter-label").text();

        expect(text).toContain(title);
        expect(text).toContain(customMessages["gs.filterLabel.all"]);
    });

    it("should render filter label title and None", () => {
        const title = "Attribute";
        const wrapper = renderFilterLabel({
            title,
            selectionSize: 0,
        });

        const text = wrapper.find(".s-attribute-filter-label").text();

        expect(text).toContain(title);
        expect(text).toContain(customMessages["gs.filterLabel.none"]);
    });

    it("should render date filter selection", () => {
        const title = "Date (created)";
        const selection = "This year";
        const wrapper = renderFilterLabel({
            title,
            selection,
            isDate: true,
            selectionSize: 100,
        });

        expect(wrapper.find(".s-attribute-filter-label").text()).toContain(`${title}: ${selection}`);
    });

    it("should update selection label", () => {
        const title = "Attribute name is very very long for the test purpose";
        const selection = "Item A";
        const newSelection = "Item B, Item C, Item D";

        const wrapper = renderFilterLabel({
            title,
            selection,
            selectionSize: 100,
        });

        wrapper.setProps({ selection: newSelection });
        expect(wrapper.find(".s-attribute-filter-label").text()).toContain(`${title}: ${newSelection}`);
    });
});
