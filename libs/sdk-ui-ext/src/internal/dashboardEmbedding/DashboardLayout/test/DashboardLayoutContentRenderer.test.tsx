// (C) 2019-2020 GoodData Corporation
import { shallow } from "enzyme";
import React from "react";
import { FluidLayoutFacade } from "@gooddata/sdk-backend-spi";
import { DashboardLayoutContentRenderer } from "../DashboardLayoutContentRenderer";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";

describe("DashboardLayoutContentRenderer", () => {
    it("should set debug style for content without ratio", () => {
        const dashboardLayoutFacade = FluidLayoutFacade.for(
            dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("kpi1", "kpi")]])]),
        );

        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                DefaultContentRenderer={DashboardLayoutContentRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("outline", "solid 1px yellow");
    });

    it("should set debug style for content with ratio", () => {
        const dashboardLayoutFacade = FluidLayoutFacade.for(
            dashboardLayoutMock([
                dashboardRowMock([
                    [
                        dashboardWidgetMock("kpi1", "kpi"),
                        { xl: { widthAsGridColumnsCount: 2, heightAsRatio: 200 } },
                    ],
                ]),
            ]),
        );

        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                DefaultContentRenderer={DashboardLayoutContentRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("border", "solid 1px green");
    });

    it("should set debug style for content with ratio, when widget is resized by dashboardLayout", () => {
        const dashboardLayoutFacade = FluidLayoutFacade.for(
            dashboardLayoutMock([
                dashboardRowMock([
                    [
                        dashboardWidgetMock("kpi1", "kpi"),
                        { xl: { widthAsGridColumnsCount: 2, heightAsRatio: 200 } },
                    ],
                ]),
            ]),
        );

        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                DefaultContentRenderer={DashboardLayoutContentRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
                isResizedByLayoutSizingStrategy
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("border", "dashed 1px #d6d6d6");
    });

    it("should set overflow style for content with ratio", () => {
        const dashboardLayoutFacade = FluidLayoutFacade.for(
            dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("kpi1", "kpi")]])]),
        );

        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                DefaultContentRenderer={DashboardLayoutContentRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                isResizedByLayoutSizingStrategy
                allowOverflow
                screen="xl"
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("overflowY", "auto");
        expect(wrapper.find("div")).toHaveStyle("overflowX", "hidden");
    });

    it("should propagate className", () => {
        const dashboardLayoutFacade = FluidLayoutFacade.for(
            dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("kpi1", "kpi")]])]),
        );
        const className = "test";
        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                DefaultContentRenderer={DashboardLayoutContentRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                isResizedByLayoutSizingStrategy
                screen="xl"
                className={className}
            />,
        );

        expect(wrapper.find("div")).toHaveClassName(className);
    });

    it("should propagate minHeight", () => {
        const dashboardLayoutFacade = FluidLayoutFacade.for(
            dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("kpi1", "kpi")]])]),
        );
        const minHeight = 100;
        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                DefaultContentRenderer={DashboardLayoutContentRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
                minHeight={minHeight}
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("minHeight", minHeight);
    });

    it("should propagate height", () => {
        const dashboardLayoutFacade = FluidLayoutFacade.for(
            dashboardLayoutMock([
                dashboardRowMock([
                    [
                        dashboardWidgetMock("kpi1", "kpi"),
                        { xl: { widthAsGridColumnsCount: 10, heightAsRatio: 50 } },
                    ],
                ]),
            ]),
        );
        const height = 100;
        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                DefaultContentRenderer={DashboardLayoutContentRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
                height={height}
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("height", height);
    });
});
