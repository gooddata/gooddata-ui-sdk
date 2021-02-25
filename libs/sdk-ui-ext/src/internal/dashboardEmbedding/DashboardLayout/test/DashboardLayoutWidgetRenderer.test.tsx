// (C) 2019-2020 GoodData Corporation
import { shallow } from "enzyme";
import React from "react";
import { DashboardLayoutBuilder } from "../builder/layout";
import { DashboardLayoutWidgetRenderer } from "../DashboardLayoutWidgetRenderer";

describe("DashboardLayoutWidgetRenderer", () => {
    it("should set debug style for content without ratio", () => {
        const layoutBuilder = DashboardLayoutBuilder.forNewLayout().addSection((s) =>
            s.addItem({ gridWidth: 12 }),
        );

        const wrapper = shallow(
            <DashboardLayoutWidgetRenderer
                DefaultWidgetRenderer={DashboardLayoutWidgetRenderer}
                item={layoutBuilder.facade().section(0).item(0)}
                screen="xl"
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("outline", "solid 1px yellow");
    });

    it("should set debug style for content with ratio", () => {
        const layoutBuilder = DashboardLayoutBuilder.forNewLayout().addSection((s) =>
            s.addItem({ gridWidth: 2, heightAsRatio: 200 }),
        );

        const wrapper = shallow(
            <DashboardLayoutWidgetRenderer
                DefaultWidgetRenderer={DashboardLayoutWidgetRenderer}
                item={layoutBuilder.facade().section(0).item(0)}
                screen="xl"
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("border", "solid 1px green");
    });

    it("should set debug style for content with ratio, when widget is resized by dashboardLayout", () => {
        const layoutBuilder = DashboardLayoutBuilder.forNewLayout().addSection((s) =>
            s.addItem({ gridWidth: 2, heightAsRatio: 200 }),
        );

        const wrapper = shallow(
            <DashboardLayoutWidgetRenderer
                DefaultWidgetRenderer={DashboardLayoutWidgetRenderer}
                item={layoutBuilder.facade().section(0).item(0)}
                screen="xl"
                isResizedByLayoutSizingStrategy
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("border", "dashed 1px #d6d6d6");
    });

    it("should set overflow style for content with ratio", () => {
        const layoutBuilder = DashboardLayoutBuilder.forNewLayout().addSection((s) =>
            s.addItem({ gridWidth: 2, heightAsRatio: 200 }),
        );

        const wrapper = shallow(
            <DashboardLayoutWidgetRenderer
                DefaultWidgetRenderer={DashboardLayoutWidgetRenderer}
                item={layoutBuilder.facade().section(0).item(0)}
                isResizedByLayoutSizingStrategy
                allowOverflow
                screen="xl"
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("overflowY", "auto");
        expect(wrapper.find("div")).toHaveStyle("overflowX", "hidden");
    });

    it("should propagate className", () => {
        const layoutBuilder = DashboardLayoutBuilder.forNewLayout().addSection((s) =>
            s.addItem({ gridWidth: 2 }),
        );

        const className = "test";
        const wrapper = shallow(
            <DashboardLayoutWidgetRenderer
                DefaultWidgetRenderer={DashboardLayoutWidgetRenderer}
                item={layoutBuilder.facade().section(0).item(0)}
                isResizedByLayoutSizingStrategy
                screen="xl"
                className={className}
            />,
        );

        expect(wrapper.find("div")).toHaveClassName(className);
    });

    it("should propagate minHeight", () => {
        const layoutBuilder = DashboardLayoutBuilder.forNewLayout().addSection((s) =>
            s.addItem({ gridWidth: 2 }),
        );
        const minHeight = 100;
        const wrapper = shallow(
            <DashboardLayoutWidgetRenderer
                DefaultWidgetRenderer={DashboardLayoutWidgetRenderer}
                item={layoutBuilder.facade().section(0).item(0)}
                screen="xl"
                minHeight={minHeight}
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("minHeight", minHeight);
    });

    it("should propagate height", () => {
        const layoutBuilder = DashboardLayoutBuilder.forNewLayout().addSection((s) =>
            s.addItem({ gridWidth: 2 }),
        );

        const height = 100;
        const wrapper = shallow(
            <DashboardLayoutWidgetRenderer
                DefaultWidgetRenderer={DashboardLayoutWidgetRenderer}
                item={layoutBuilder.facade().section(0).item(0)}
                screen="xl"
                height={height}
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("height", height);
    });
});
