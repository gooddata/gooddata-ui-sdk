// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Row } from "react-grid-system";
import { DashboardLayoutSection } from "../DashboardLayoutSection";
import { DashboardLayoutItem } from "../DashboardLayoutItem";
import { IDashboardLayoutSectionRenderer } from "../interfaces";
import { DashboardLayoutBuilder } from "../builder/layout";
import { createArrayWithSize } from "./fixtures";

const customRowRendererClass = "s-row-renderer";

const customRowRenderer: IDashboardLayoutSectionRenderer<string> = ({ children }) => (
    <div className={customRowRendererClass}>{children}</div>
);

describe("DashboardLayoutSection", () => {
    it.each(createArrayWithSize(5).map((_, i) => i))("should render %s items", (size: number) => {
        const layoutFacade = DashboardLayoutBuilder.forNewLayout()
            .addSection((section) => {
                createArrayWithSize(size).forEach(() => {
                    section.addItem({ gridWidth: 2 });
                });
                return section;
            })
            .facade();
        const wrapper = shallow(<DashboardLayoutSection section={layoutFacade.section(0)} screen="xl" />);
        expect(wrapper.find(DashboardLayoutItem)).toHaveLength(size);
    });

    it("should use default row renderer, when rowRenderer prop is not provided", () => {
        const layoutFacade = DashboardLayoutBuilder.forNewLayout().addSection().facade();
        const wrapper = shallow(<DashboardLayoutSection section={layoutFacade.section(0)} screen="xl" />);
        expect(wrapper.find(Row)).toExist();
    });

    it("should use provided row renderer, when rowRenderer prop is provided", () => {
        const layoutFacade = DashboardLayoutBuilder.forNewLayout().addSection().facade();
        const wrapper = shallow(
            <DashboardLayoutSection
                section={layoutFacade.section(0)}
                screen="xl"
                sectionRenderer={customRowRenderer}
            />,
        );

        expect(wrapper.find(`.${customRowRendererClass}`)).toExist();
    });
});
