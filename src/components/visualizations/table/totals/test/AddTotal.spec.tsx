// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import Dropdown from "@gooddata/goodstrap/lib/Dropdown/Dropdown";

import { AddTotal, IAddTotalProps } from "../AddTotal";
import { AddTotalButton } from "../AddTotalButton";

describe("AddTotal", () => {
    function renderComponent(customProps = {}) {
        const props: IAddTotalProps = {
            dataSource: {},
            header: {
                measureHeaderItem: {
                    localIdentifier: "foo",
                    name: "Foo",
                    format: "bar",
                },
            },
            columnIndex: 3,
            headersCount: 5,
            addingMoreTotalsEnabled: true,
        };

        return mount(<AddTotal {...props} {...customProps} />);
    }

    it("should render component", () => {
        const component = renderComponent();

        expect(component.find(".indigo-totals-add-wrapper").length).toBe(1);
    });

    it("should call onDropdownOpenStateChanged and set/unset wrapper class on dropdown open/close", () => {
        const onDropdownOpenStateChanged = jest.fn();
        const component = renderComponent({
            onDropdownOpenStateChanged,
        });

        const componentInstance: any = component.instance();
        const componentNode: any = component.childAt(0).instance();

        componentInstance.onOpenStateChanged(3, true);

        expect(onDropdownOpenStateChanged).toBeCalledWith(3, true);
        expect(componentNode.classList).toContain("dropdown-active");

        componentInstance.onOpenStateChanged(3, false);

        expect(onDropdownOpenStateChanged).toBeCalledWith(3, false);
        expect(componentNode.classList).not.toContain("dropdown-active");
    });

    it("should properly call 'onWrapperHover' callback upon particular events", () => {
        const headerIndex = 2;
        const onWrapperHover = jest.fn();
        const component = renderComponent({
            columnIndex: headerIndex,
            onWrapperHover,
        });

        component.find(".indigo-totals-add-wrapper").simulate("mouseenter");

        expect(onWrapperHover).toBeCalledWith(headerIndex, true);
        expect(onWrapperHover).toHaveBeenCalledTimes(1);

        component.find(".indigo-totals-add-wrapper").simulate("mouseleave");

        expect(onWrapperHover).toBeCalledWith(headerIndex, false);
        expect(onWrapperHover.mock.calls.length).toEqual(2);
    });

    it("should render <Dropdown /> component inside of the <AddTotal /> component", () => {
        const component = renderComponent();

        expect(component.find(Dropdown).length).toBe(1);
    });

    describe("rendering <AddTotalButton /> dropdown button component", () => {
        it("should render dropdown button", () => {
            const component = renderComponent();

            expect(component.find(AddTotalButton).length).toBe(1);
        });

        it("should pass 'hidden' prop to dropdown button", () => {
            const component = renderComponent();
            const props = component.find(AddTotalButton).props();

            expect(props.hidden).toBe(false);
        });

        it("should properly call given callbacks upon particular events on dropdown button", () => {
            const onDropdownOpenStateChanged = jest.fn();
            const onButtonHover = jest.fn();
            const component = renderComponent({
                onDropdownOpenStateChanged,
                onButtonHover,
            });

            component
                .find(AddTotalButton)
                .props()
                .onClick();
            expect(onDropdownOpenStateChanged).toHaveBeenCalledTimes(1);

            component
                .find(AddTotalButton)
                .props()
                .onMouseEnter();
            expect(onButtonHover).toBeCalledWith(3, true);
            expect(onButtonHover).toHaveBeenCalledTimes(1);

            component
                .find(AddTotalButton)
                .props()
                .onMouseLeave();
            expect(onButtonHover).toBeCalledWith(3, false);
            expect(onButtonHover).toHaveBeenCalledTimes(2);
        });
    });
});
