// (C) 2007-2022 GoodData Corporation
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import React from "react";
import { mount } from "enzyme";
import { DropdownButton } from "@gooddata/sdk-ui-kit";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import noop from "lodash/noop";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { AttributeDropdown } from "../AttributeDropdown";
import { AttributeFilterItem } from "../AttributeFilterItem";

/*
 * TODO: find a common place for this; possibly test support lib?
 */
const waitForAsync = () =>
    new Promise((resolve: (...args: any[]) => void) =>
        setTimeout(() => {
            setTimeout(() => {
                resolve();
            }, 300);
        }),
    );

/*
 * NOTE: I suspect these tests may be flaky; I happened on a test run where one of them failed -> no change -> rerun
 *  -> all is good. The failed test run was in batch test mode (no interactive jest run)
 */
describe("AttributeDropdown@next", () => {
    const backend = recordedBackend(ReferenceRecordings.Recordings);
    const workspace = "testWorkspace";
    const testAttributeRef = attributeDisplayFormRef(ReferenceMd.Product.Name);

    function renderComponent(props: any = {}) {
        const onApply = props.onApply || noop;
        return mount(
            <IntlWrapper locale="en-US">
                <AttributeDropdown {...{ ...props, backend, workspace, onApply }} />
            </IntlWrapper>,
        );
    }

    // we have to wait for the debounced onSearch
    const waitForDebounce = () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 300);
        });

    afterEach(() => {
        // for some reason the document.body gets polluted and has to be cleared after every test
        // otherwise every subsequent test fails
        document.body.innerHTML = "";
    });

    it("should render attribute title", () => {
        const wrapper = renderComponent({ title: "Foo" });
        expect(wrapper.find(".gd-attribute-filter__next .gd-button-text").text()).toBe("Foo");
    });

    it("should render overlay with loaded items", async () => {
        const wrapper = renderComponent({ title: "Foo", displayForm: testAttributeRef });
        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        expect(wrapper.find(AttributeFilterItem).length).toBeGreaterThan(0);
    });

    it("should fire onApply with the proper selection", async () => {
        const onApply = jest.fn();
        const wrapper = renderComponent({
            title: "Foo",
            displayForm: testAttributeRef,
            isInverted: true,
            onApply,
        });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        wrapper.find(AttributeFilterItem).first().simulate("click");

        wrapper.find("button.s-apply").simulate("click");

        expect(onApply).toHaveBeenCalledTimes(1);
        expect(onApply).toHaveBeenCalledWith(
            [
                {
                    title: "CompuSci",
                    uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=165678",
                },
            ],
            true,
        );
    });

    it("should keep selection after Apply", async () => {
        const onApply = jest.fn();
        const wrapper = renderComponent({
            title: "Foo",
            displayForm: testAttributeRef,
            isInverted: true,
            onApply,
        });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        wrapper.find(AttributeFilterItem).first().simulate("click");

        wrapper.find("button.s-apply").simulate("click");

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        expect(wrapper.find(".s-attribute-filter-list-item-selected").length).toEqual(6);
    });

    it("should reset selection on Cancel", async () => {
        const onApply = jest.fn();
        const wrapper = renderComponent({
            title: "Foo",
            displayForm: testAttributeRef,
            isInverted: true,
            onApply,
        });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        wrapper.find(AttributeFilterItem).first().simulate("click");

        wrapper.find("button.s-cancel").simulate("click");

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        expect(wrapper.find(".s-attribute-filter-list-item-selected").length).toEqual(7);
    });

    it("should limit items by search string", async () => {
        const wrapper = renderComponent({ title: "Foo", displayForm: testAttributeRef });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        wrapper
            .find("input")
            .first()
            .simulate("change", { target: { value: "CompuSci" } });

        await waitForDebounce();
        await waitForAsync();
        wrapper.update();

        const dropdownItems = document.querySelectorAll(".s-attribute-filter-list-item");
        expect(dropdownItems.length).toBe(1);
    });

    it("should reset search string on cancel", async () => {
        const wrapper = renderComponent({ title: "Foo", displayForm: testAttributeRef });
        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        wrapper
            .find("input")
            .first()
            .simulate("change", { target: { value: "CompuSci" } });

        await waitForDebounce();

        wrapper.update();
        expect(wrapper.find("LegacyInvertableList").prop("searchString")).toBe("CompuSci");

        /**
         * Debounce is needed here because we need to slow down the cancelation;
         * otherwise, the state of the searchString will persist for some reason.
         */
        await waitForDebounce();

        wrapper.find("button.s-cancel").simulate("click");
        wrapper.update();
        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();
        expect(wrapper.find("LegacyInvertableList").prop("searchString")).toBe("");
    });

    it("should render dropdown button customized title with selected items and count", async () => {
        const onApply = jest.fn();
        const wrapper = renderComponent({
            displayForm: testAttributeRef,
            titleWithSelection: true,
            title: "Foo",
            isInverted: true,
            onApply,
        });

        await waitForAsync();
        wrapper.update();

        expect(wrapper.find(".gd-attribute-filter__next .gd-button-text").text()).toBe("Foo: All");

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        wrapper.update();

        wrapper.find(AttributeFilterItem).first().simulate("click");

        wrapper.find("button.s-apply").simulate("click");

        await waitForAsync();
        wrapper.update();

        expect(wrapper.find(".gd-attribute-filter__next .gd-button-text").text()).toBe(
            "Foo: All except CompuSci (1)",
        );
    });

    it("should be in loading state until items are loaded", () => {
        const wrapper = renderComponent({
            displayForm: testAttributeRef,
            titleWithSelection: true,
            isLoading: true,
        });

        expect(wrapper.exists(".s-button-loading")).toEqual(true);
    });
});
