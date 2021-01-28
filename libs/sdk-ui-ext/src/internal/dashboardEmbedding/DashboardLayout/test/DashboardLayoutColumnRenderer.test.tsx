// (C) 2019-2020 GoodData Corporation
import React from "react";
import zip from "lodash/zip";
import { shallow } from "enzyme";
import { FluidLayoutFacade, IFluidLayoutSizeByScreen } from "@gooddata/sdk-backend-spi";
import { DashboardLayoutColumnRenderer } from "../DashboardLayoutColumnRenderer";
import { FluidLayoutColumnRenderer, ALL_SCREENS } from "../../FluidLayout";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";

const testWidths = [12, 10, 6, 4, 2];
const testRatios = [100, 200, 50, 100, 60];
const testCases = zip(ALL_SCREENS, testWidths, testRatios);

const sizeForAllScreens: IFluidLayoutSizeByScreen = testCases.reduce(
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
);

const dashboardLayout = dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("tableId", "table")]])]);
const dashboardLayoutWitchSizing = dashboardLayoutMock([
    dashboardRowMock([[dashboardWidgetMock("tableId", "table"), sizeForAllScreens]]),
]);
const dashboardLayoutFacade = FluidLayoutFacade.for(dashboardLayout);
const dashboardLayoutWithSizingFacade = FluidLayoutFacade.for(dashboardLayoutWitchSizing);

describe("DashboardLayoutColumnRenderer", () => {
    it("should set minHeight:0 to override default grid style", () => {
        const wrapper = shallow(
            <DashboardLayoutColumnRenderer
                DefaultRenderer={FluidLayoutColumnRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveProp("minHeight", 0);
    });

    it("should set custom minHeight, when provided", () => {
        const wrapper = shallow(
            <DashboardLayoutColumnRenderer
                DefaultRenderer={FluidLayoutColumnRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
                minHeight={100}
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveProp("minHeight", 100);
    });

    it.each(testCases)(
        "should set class names for screen %s, width %d, and ratio %d",
        (screen, width, ratio) => {
            const wrapper = shallow(
                <DashboardLayoutColumnRenderer
                    DefaultRenderer={FluidLayoutColumnRenderer}
                    column={dashboardLayoutWithSizingFacade.rows().row(0).columns().column(0)}
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
                DefaultRenderer={FluidLayoutColumnRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
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
                DefaultRenderer={FluidLayoutColumnRenderer}
                column={dashboardLayoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
                className={className}
            />,
        );

        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveClassName(className);
    });
});
