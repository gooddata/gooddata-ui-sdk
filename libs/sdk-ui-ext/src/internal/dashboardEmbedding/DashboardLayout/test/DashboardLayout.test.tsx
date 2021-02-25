// (C) 2019-2020 GoodData Corporation
import React from "react";
import add from "lodash/add";
import { mount } from "enzyme";
import { DashboardLayout } from "../DashboardLayout";
import { DashboardLayoutItem } from "../DashboardLayoutItem";
import { DashboardLayoutSection } from "../DashboardLayoutSection";
import { createArrayWithSize } from "./fixtures";
import { DashboardLayoutBuilder } from "../builder/layout";
import { defaultItemXlSize } from "../builder/tests/utils";

describe("DashboardLayout", () => {
    it.each([
        ["is empty", [0]],
        ["has 1 row with 1 column", [1]],
        ["has 5 rows with various columns count", [5, 3, 0, 2, 1]],
    ])("should render fluid layout when layout %s", (_testCase: string, itemsCountInSection: number[]) => {
        const layout = DashboardLayoutBuilder.forNewLayout();

        itemsCountInSection.forEach((itemsCount) => {
            layout.addSection((section) => {
                createArrayWithSize(itemsCount).forEach(() => {
                    section.addItem(defaultItemXlSize);
                });

                return section;
            });
        });

        const wrapper = mount(<DashboardLayout layout={layout.build()} widgetRenderer={() => <div />} />);

        expect(wrapper.find(DashboardLayoutSection)).toHaveLength(itemsCountInSection.length);
        expect(wrapper.find(DashboardLayoutItem)).toHaveLength(itemsCountInSection.reduce(add, 0));
    });
});
