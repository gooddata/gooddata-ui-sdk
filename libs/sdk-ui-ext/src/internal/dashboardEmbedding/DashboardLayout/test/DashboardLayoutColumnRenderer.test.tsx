// (C) 2019-2020 GoodData Corporation
import React from "react";
import zip from "lodash/zip";
import { shallow } from "enzyme";
import { DashboardLayoutColumnRenderer } from "../DashboardLayoutColumnRenderer";
import { FluidLayoutColumnRenderer, ALL_SCREENS } from "../../FluidLayout";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";
import { IDashboardViewLayoutColumn } from "../interfaces/dashboardLayout";

const dashboardLayout = dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("tableId", "table")]])]);

const testWidths = [12, 10, 6, 4, 2];
const testRatios = [100, 200, 50, 100, 60];
const testCases = zip(ALL_SCREENS, testWidths, testRatios);

const testColumn: IDashboardViewLayoutColumn = {
    size: testCases.reduce(
        (acc, [screen, widthAsGridColumnsCount, heightAsRatio]) => ({
            ...acc,
            [screen]: {
                widthAsGridColumnsCount,
                heightAsRatio,
            },
        }),
        {
            xl: {
                widthAsGridColumnsCount: 0,
            },
        },
    ),
};

describe("DashboardLayoutColumnRenderer", () => {
    it("should set minHeight:0 to override default grid style", () => {
        const wrapper = shallow(
            <DashboardLayoutColumnRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveStyle("minHeight", 0);
    });

    it("should set custom minHeight, when provided", () => {
        const wrapper = shallow(
            <DashboardLayoutColumnRenderer
                column={dashboardLayout.rows[0].columns[0]}
                row={dashboardLayout[0]}
                columnIndex={0}
                rowIndex={0}
                screen="xl"
                style={{
                    minHeight: 100,
                }}
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveStyle("minHeight", 100);
    });

    it.each(testCases)(
        "should set class names for screen %s, width %d, and ratio %d",
        (screen, width, ratio) => {
            const wrapper = shallow(
                <DashboardLayoutColumnRenderer
                    row={{ columns: [] }}
                    column={testColumn}
                    rowIndex={0}
                    columnIndex={0}
                    screen={screen}
                />,
            );

            expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveClassName(
                `s-fluid-layout-screen-${screen}`,
            );
            expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveClassName(
                `s-fluid-layout-column-width-${width}`,
            );
            expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveClassName(
                `s-fluid-layout-column-ratio-${ratio}`,
            );
        },
    );

    it("should not set ratio class for column without ratio", () => {
        const wrapper = shallow(
            <DashboardLayoutColumnRenderer
                row={{ columns: [] }}
                column={{
                    size: {
                        xl: {
                            widthAsGridColumnsCount: 12,
                        },
                    },
                }}
                rowIndex={0}
                columnIndex={0}
                screen="xl"
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer).props().className).not.toMatch(
            /s-fluid-layout-column-ratio-/,
        );
    });

    it("should propagate className", () => {
        const className = "test";
        const wrapper = shallow(
            <DashboardLayoutColumnRenderer
                row={{ columns: [] }}
                column={testColumn}
                rowIndex={0}
                columnIndex={0}
                screen="xl"
                className={className}
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveClassName(className);
    });

    it("should propagate style", () => {
        const style = { backgroundColor: "red" };
        const wrapper = shallow(
            <DashboardLayoutColumnRenderer
                row={{ columns: [] }}
                column={testColumn}
                rowIndex={0}
                columnIndex={0}
                screen="xl"
                style={style}
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveStyle(style);
    });
});
