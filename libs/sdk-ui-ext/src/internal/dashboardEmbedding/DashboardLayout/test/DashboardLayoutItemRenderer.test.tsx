// (C) 2019-2020 GoodData Corporation
import React from "react";
import zip from "lodash/zip";
import { shallow } from "enzyme";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-backend-spi";
import { ALL_SCREENS } from "../constants";
import { DashboardLayoutFacade } from "../facade/layout";
import { DashboardLayoutItemRenderer } from "../DashboardLayoutItemRenderer";
import { defaultItemXlSize } from "../builder/tests/utils";
import { DashboardLayoutBuilder } from "../builder/layout";
import { Col } from "react-grid-system";

const testWidths = [12, 10, 6, 4, 2];
const testRatios = [100, 200, 50, 100, 60];
const testCases = zip(ALL_SCREENS, testWidths, testRatios);

const sizeForAllScreens: IDashboardLayoutSizeByScreenSize = testCases.reduce(
    (acc, [screen, gridWidth, heightAsRatio]) => ({
        ...acc,
        [screen]: {
            gridWidth,
            heightAsRatio,
        },
    }),
    {
        xl: {
            gridWidth: 0,
        },
    },
);

const dashboardLayout = DashboardLayoutBuilder.forNewLayout()
    .addSection((s) => s.addItem({ gridWidth: 12 }))
    .build();

const dashboardLayoutWithSizing = DashboardLayoutBuilder.forNewLayout()
    .addSection((s) => s.addItem(defaultItemXlSize, (i) => i.size(sizeForAllScreens)))
    .build();

const dashboardLayoutFacade = DashboardLayoutFacade.for(dashboardLayout);
const dashboardLayoutWithSizingFacade = DashboardLayoutFacade.for(dashboardLayoutWithSizing);

describe("DashboardLayoutItemRenderer", () => {
    it("should propagate responsive widths to Col component", () => {
        const wrapper = shallow(
            <DashboardLayoutItemRenderer
                DefaultItemRenderer={DashboardLayoutItemRenderer}
                item={dashboardLayoutWithSizingFacade.section(0).item(0)}
                screen="xl"
            >
                Test
            </DashboardLayoutItemRenderer>,
        );
        expect(wrapper.find(Col)).toHaveProp("xl", 12);
        expect(wrapper.find(Col)).toHaveProp("lg", 10);
        expect(wrapper.find(Col)).toHaveProp("md", 6);
        expect(wrapper.find(Col)).toHaveProp("sm", 4);
        expect(wrapper.find(Col)).toHaveProp("xs", 2);
    });

    it("should set minHeight:0 to override default grid style", () => {
        const wrapper = shallow(
            <DashboardLayoutItemRenderer
                DefaultItemRenderer={DashboardLayoutItemRenderer}
                item={dashboardLayoutFacade.section(0).item(0)}
                screen="xl"
            >
                Test
            </DashboardLayoutItemRenderer>,
        );

        expect(wrapper.find(Col)).toHaveStyle("minHeight", 0);
    });

    it("should set custom minHeight, when provided", () => {
        const wrapper = shallow(
            <DashboardLayoutItemRenderer
                DefaultItemRenderer={DashboardLayoutItemRenderer}
                item={dashboardLayoutFacade.section(0).item(0)}
                screen="xl"
                minHeight={100}
            >
                Test
            </DashboardLayoutItemRenderer>,
        );

        expect(wrapper.find(Col)).toHaveStyle("minHeight", 100);
    });

    it.each(testCases)(
        "should set class names for screen %s, width %d, and ratio %d",
        (screen, width, ratio) => {
            const wrapper = shallow(
                <DashboardLayoutItemRenderer
                    DefaultItemRenderer={DashboardLayoutItemRenderer}
                    item={dashboardLayoutWithSizingFacade.section(0).item(0)}
                    screen={screen}
                >
                    Test
                </DashboardLayoutItemRenderer>,
            );

            expect(wrapper.find(Col)).toHaveClassName(`s-fluid-layout-screen-${screen}`);
            expect(wrapper.find(Col)).toHaveClassName(`s-fluid-layout-column-width-${width}`);
            expect(wrapper.find(Col)).toHaveClassName(`s-fluid-layout-column-ratio-${ratio}`);
        },
    );

    it("should not set ratio class for column without ratio", () => {
        const wrapper = shallow(
            <DashboardLayoutItemRenderer
                DefaultItemRenderer={DashboardLayoutItemRenderer}
                item={dashboardLayoutFacade.section(0).item(0)}
                screen="xl"
            >
                Test
            </DashboardLayoutItemRenderer>,
        );

        expect(wrapper.find(Col).props().className).not.toMatch(/s-fluid-layout-column-ratio-/);
    });

    it("should propagate className", () => {
        const className = "test";
        const wrapper = shallow(
            <DashboardLayoutItemRenderer
                DefaultItemRenderer={DashboardLayoutItemRenderer}
                item={dashboardLayoutFacade.section(0).item(0)}
                screen="xl"
                className={className}
            >
                Test
            </DashboardLayoutItemRenderer>,
        );

        expect(wrapper.find(Col)).toHaveClassName(className);
    });
});
