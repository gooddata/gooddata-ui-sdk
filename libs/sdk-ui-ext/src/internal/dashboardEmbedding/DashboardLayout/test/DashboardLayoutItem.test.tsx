// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Col } from "react-grid-system";
import { DashboardLayoutItem } from "../DashboardLayoutItem";
import { DashboardLayoutBuilder } from "../builder/layout";
import { IDashboardLayoutItemRenderer, IDashboardLayoutWidgetRenderer } from "../interfaces";

const customColumnRendererClass = "s-item-renderer";
const customContentRendererClass = "s-item-renderer";

const customColumnRenderer: IDashboardLayoutItemRenderer<string> = ({ children }) => (
    <div className={customColumnRendererClass}>{children}</div>
);
const customWidgetRenderer: IDashboardLayoutWidgetRenderer<string> = ({ item }) => (
    <div className={customContentRendererClass}>{item.widget()}</div>
);

const layoutFacade = DashboardLayoutBuilder.forNewLayout()
    .addSection((s) => s.addItem({ gridWidth: 12 }))
    .facade();

describe("DashboardLayoutItem", () => {
    it("should use default item renderer, when itemRenderer prop is not provided", () => {
        const wrapper = shallow(
            <DashboardLayoutItem
                screen="xl"
                item={layoutFacade.section(0).item(0)}
                widgetRenderer={customWidgetRenderer}
            />,
        );
        expect(wrapper.find(Col)).toExist();
    });

    it("should use provided item renderer, when itemRenderer prop is provided", () => {
        const wrapper = shallow(
            <DashboardLayoutItem
                screen="xl"
                item={layoutFacade.section(0).item(0)}
                itemRenderer={customColumnRenderer}
                widgetRenderer={customWidgetRenderer}
            />,
        );

        expect(wrapper.find(`.${customColumnRendererClass}`)).toExist();
    });

    it("should use provided widget renderer", () => {
        const wrapper = shallow(
            <DashboardLayoutItem
                screen="xl"
                item={layoutFacade.section(0).item(0)}
                widgetRenderer={customWidgetRenderer}
            />,
        );

        expect(wrapper.find(`.${customContentRendererClass}`)).toExist();
    });
});
