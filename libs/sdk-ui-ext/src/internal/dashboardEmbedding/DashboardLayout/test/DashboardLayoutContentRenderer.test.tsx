// (C) 2019-2020 GoodData Corporation
import { shallow } from "enzyme";
import React from "react";
import { DashboardLayoutContentRenderer } from "../DashboardLayoutContentRenderer";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";

describe("DashboardLayoutContentRenderer", () => {
    it("should set debug style for content without ratio", () => {
        const dashboardLayout = dashboardLayoutMock([
            dashboardRowMock([[dashboardWidgetMock("kpi1", "kpi")]]),
        ]);
        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout.rows[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("outline", "solid 1px yellow");
    });

    it("should set debug style for content with ratio", () => {
        const dashboardLayout = dashboardLayoutMock([
            dashboardRowMock([
                [dashboardWidgetMock("kpi1", "kpi"), { widthAsGridColumnsCount: 2, heightAsRatio: 200 }],
            ]),
        ]);

        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout.rows[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("border", "solid 1px green");
    });

    it("should set debug style for content with ratio, when widget is resized by dashboardLayout", () => {
        const dashboardLayout = dashboardLayoutMock([
            dashboardRowMock([
                [
                    dashboardWidgetMock("kpi1", "kpi", true),
                    { widthAsGridColumnsCount: 2, heightAsRatio: 200 },
                ],
            ]),
        ]);

        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout.rows[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
                debug
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("border", "dashed 1px #d6d6d6");
    });

    it("should set height and overflow style for content with ratio", () => {
        const dashboardLayout = dashboardLayoutMock([
            dashboardRowMock([
                [
                    dashboardWidgetMock("kpi1", "kpi", true),
                    { widthAsGridColumnsCount: 4, heightAsRatio: 150 },
                ],
            ]),
        ]);

        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout.rows[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
            />,
        );

        expect(wrapper.find("div")).toHaveStyle("overflowY", "auto");
        expect(wrapper.find("div")).toHaveStyle("overflowX", "hidden");
        expect(wrapper.find("div")).toHaveStyle("height", 826);
    });

    it("should propagate className", () => {
        const dashboardLayout = dashboardLayoutMock([
            dashboardRowMock([[dashboardWidgetMock("kpi1", "kpi")]]),
        ]);
        const className = "test";
        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout.rows[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
                className={className}
            />,
        );

        expect(wrapper.find("div")).toHaveClassName(className);
    });

    it("should propagate other html props", () => {
        const dashboardLayout = dashboardLayoutMock([
            dashboardRowMock([[dashboardWidgetMock("kpi1", "kpi")]]),
        ]);
        const style = { backgroundColor: "red" };
        const wrapper = shallow(
            <DashboardLayoutContentRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout.rows[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
                style={style}
            />,
        );

        expect(wrapper.find("div")).toHaveStyle(style);
    });
});
