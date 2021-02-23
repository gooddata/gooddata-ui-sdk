// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Row } from "react-grid-system";
import { DashboardLayoutSectionRenderer } from "../DashboardLayoutSectionRenderer";
import { DashboardLayoutBuilder } from "../builder/layout";

const layoutFacade = DashboardLayoutBuilder.forNewLayout().addSection().facade();

describe("DashboardLayoutSectionRenderer", () => {
    it("should propagate className", () => {
        const className = "test";
        const wrapper = shallow(
            <DashboardLayoutSectionRenderer
                section={layoutFacade.section(0)}
                screen="xl"
                className={className}
                DefaultSectionRenderer={DashboardLayoutSectionRenderer}
            >
                Test
            </DashboardLayoutSectionRenderer>,
        );

        expect(wrapper.find(Row)).toHaveClassName(className);
    });

    it("should add debug css class in debug mode", () => {
        const wrapper = shallow(
            <DashboardLayoutSectionRenderer
                DefaultSectionRenderer={DashboardLayoutSectionRenderer}
                section={layoutFacade.section(0)}
                screen="xl"
                debug
            >
                Test
            </DashboardLayoutSectionRenderer>,
        );

        expect(wrapper.find(Row)).toHaveClassName("gd-fluidlayout-row-debug");
    });
});
