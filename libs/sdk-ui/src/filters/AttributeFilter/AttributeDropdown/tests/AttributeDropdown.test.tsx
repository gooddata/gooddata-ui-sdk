// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { DropdownButton } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { legacyRecordedBackend } from "@gooddata/sdk-backend-mockingbird";
import noop = require("lodash/noop");
import { IntlWrapper } from "../../../../base/localization/IntlWrapper";
import { MasterIndex } from "../../../../../__mocks__/recordings/playlist";
import { waitForAsync } from "../../../../../testUtils/synchronization";

import { AttributeDropdown } from "../AttributeDropdown";
import { AttributeFilterItem } from "../AttributeFilterItem";

/*
 * NOTE: I suspect these tests may be flaky; I happened on a test run where one of them failed -> no change -> rerun
 *  -> all is good. The failed test run was in batch test mode (no interactive jest run)
 */
describe("AttributeDropdown", () => {
    const backend = legacyRecordedBackend(MasterIndex);
    const workspace = "testWorkspace";

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
        new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 300);
        });

    afterEach(() => {
        // for some reason the document.body gets polluted and has to be cleared after every test
        // otherwise every subsequent test fails
        // tslint:disable-next-line:no-inner-html
        document.body.innerHTML = "";
    });

    it("should render attribute title", () => {
        const wrapper = renderComponent({ title: "Foo" });
        expect(wrapper.find(".gd-attribute-filter .gd-button-text").text()).toBe("Foo");
    });

    it("should render overlay with loaded items", async () => {
        const wrapper = renderComponent({ title: "Foo", identifier: "label.method.method" });
        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        expect(wrapper.find(AttributeFilterItem).length).toBeGreaterThan(0);
    });

    it("should fire onApply with the proper selection", async () => {
        const onApply = jest.fn();
        const wrapper = renderComponent({ title: "Foo", identifier: "label.method.method", onApply });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        wrapper
            .find(AttributeFilterItem)
            .first()
            .simulate("click");

        wrapper.find("button.s-apply").simulate("click");

        expect(onApply).toHaveBeenCalledTimes(1);
        expect(onApply).toHaveBeenCalledWith(
            [{ title: "DELETE", uri: "/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/375/elements?id=110" }],
            true,
        );
    });

    it("should keep selection after Apply", async () => {
        const onApply = jest.fn();
        const wrapper = renderComponent({ title: "Foo", identifier: "label.method.method", onApply });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        wrapper
            .find(AttributeFilterItem)
            .first()
            .simulate("click");

        wrapper.find("button.s-apply").simulate("click");

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        expect(wrapper.find(".s-attribute-filter-list-item-selected").length).toEqual(7);
    });

    it("should reset selection on Cancel", async () => {
        const onApply = jest.fn();
        const wrapper = renderComponent({ title: "Foo", identifier: "label.method.method", onApply });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        wrapper
            .find(AttributeFilterItem)
            .first()
            .simulate("click");

        wrapper.find("button.s-cancel").simulate("click");

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        expect(wrapper.find(".s-attribute-filter-list-item-selected").length).toEqual(8);
    });

    it("should limit items by search string", async () => {
        const wrapper = renderComponent({ title: "Foo", identifier: "label.method.method" });

        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        wrapper
            .find("input")
            .first()
            .simulate("change", { target: { value: "DELETE" } });

        await waitForDebounce();
        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        const dropdownItems = document.querySelectorAll(".s-attribute-filter-list-item");
        expect(dropdownItems.length).toBe(1);
    });

    it("should reset search string on cancel", async () => {
        const wrapper = renderComponent({ title: "Foo", identifier: "label.method.method" });
        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();

        wrapper
            .find("input")
            .first()
            .simulate("change", { target: { value: "DELETE" } });

        await waitForDebounce();

        wrapper.update();
        expect(wrapper.find("InvertableList").prop("searchString")).toBe("DELETE");

        wrapper.find("button.s-cancel").simulate("click");
        wrapper.update();
        wrapper.find(DropdownButton).simulate("click");

        await waitForAsync();
        await waitForAsync(); // There have to be two of those for some reason :-/
        wrapper.update();
        expect(wrapper.find("InvertableList").prop("searchString")).toBe("");
    });
});
