// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");

import { DropdownItem } from "../DropdownItem";
import { withIntl } from "../../../utils/intlUtils";

const FIXTURE = {
    item: {
        role: "",
        type: "sum",
        disabled: false,
        title: "visualizations.totals.dropdown.title.sum",
    },
    disabledItem: {
        role: "",
        type: "avg",
        disabled: true,
        title: "visualizations.totals.dropdown.title.avg",
    },
    headerItem: {
        role: "header",
        title: "visualizations.totals.dropdown.heading",
    },
};

const WrappedComponent = withIntl(DropdownItem);

describe("DropdownItem", () => {
    function renderComponent(customProps = {}) {
        const props = {
            item: FIXTURE.item,
            onSelect: noop,
        };

        return mount(<WrappedComponent {...props} {...customProps} />);
    }

    it("should render header item", () => {
        const wrapper = renderComponent({
            item: FIXTURE.headerItem,
        });

        expect(wrapper.find(".gd-list-item-header").length).toEqual(1);
    });

    it("should render item with proper s-class", () => {
        const wrapper = renderComponent();

        expect(wrapper.find(`.s-totals-select-type-item-${FIXTURE.item.type}`).length).toEqual(1);
    });

    it("should render item with disabled classname", () => {
        const wrapper = renderComponent({
            item: FIXTURE.disabledItem,
        });

        expect(wrapper.find(".indigo-totals-select-type-item-disabled").length).toEqual(1);
    });

    it("should call onSelect callback on click", () => {
        const onSelect = jest.fn();
        const wrapper = renderComponent({ onSelect });

        wrapper.find(".gd-list-item").simulate("click");

        expect(onSelect.mock.calls.length).toBe(1);
    });

    it("should not call onSelect callback on click if it is disabled", () => {
        const onSelect = jest.fn();
        const wrapper = renderComponent({
            item: FIXTURE.disabledItem,
            onSelect,
        });

        wrapper.find(".gd-list-item").simulate("click");

        expect(onSelect.mock.calls.length).toBe(0);
    });
});
