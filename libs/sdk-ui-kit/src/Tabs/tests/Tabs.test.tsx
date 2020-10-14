// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";

import { withIntl } from "@gooddata/sdk-ui";
import { Tabs, ITabsProps } from "../Tabs";

const renderTabs = (options: ITabsProps): ReactWrapper => {
    const messages = {
        tab1: "Tab 1",
        tab2: "Tab 2",
    };

    const Wrapper = withIntl(Tabs, "en-US", messages);

    return mount(<Wrapper {...options} />);
};

describe("Tabs", () => {
    const tabDefinitions = [{ id: "tab1" }, { id: "tab2" }];

    let root: ReactWrapper;
    let tabSelectStub: jest.Mock;

    beforeEach(() => {
        tabSelectStub = jest.fn();
        root = renderTabs({
            tabs: tabDefinitions,
            onTabSelect: tabSelectStub,
        });
    });

    it("should render all tabs", () => {
        const tabs = root.find(".gd-tab");
        expect(tabs.length).toEqual(tabDefinitions.length);
    });

    it("should render first tab selected by default", () => {
        expect(root.find(".s-tab1").hasClass("is-active")).toEqual(true);
        expect(root.find(".s-tab2").hasClass("is-active")).toEqual(false);
    });

    it("should select tab by selectedTabId", () => {
        const rootWithSelected = renderTabs({
            tabs: tabDefinitions,
            onTabSelect: tabSelectStub,
            selectedTabId: tabDefinitions[1].id,
        });

        expect(rootWithSelected.find(".s-tab1").hasClass("is-active")).toEqual(false);
        expect(rootWithSelected.find(".s-tab2").hasClass("is-active")).toEqual(true);
    });

    it("should call callback on tab select", () => {
        root.find(".s-tab2").simulate("click");
        expect(tabSelectStub).toHaveBeenCalledTimes(1);
        root.find(".s-tab2").simulate("click");
        expect(tabSelectStub).toHaveBeenCalledTimes(1);
    });

    it("should switch second tab to be active on click", () => {
        root.find(".s-tab2").simulate("click");

        expect(root.find(".s-tab1").hasClass("is-active")).toEqual(false);
        expect(root.find(".s-tab2").hasClass("is-active")).toEqual(true);
    });
});
