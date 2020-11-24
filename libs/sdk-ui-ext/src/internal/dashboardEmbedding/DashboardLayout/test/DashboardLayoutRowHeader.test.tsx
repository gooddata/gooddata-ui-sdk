// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { DashboardLayoutRowHeader } from "../DashboardLayoutRowHeader";
import { DashboardLayoutRowHeaderDescription } from "../DashboardLayoutRowHeaderDescription";

const CustomComponent: React.FC = () => <div />;

describe("DashboardLayoutRowHeader", () => {
    it.each([
        ["", "title", 1],
        ["not", undefined, 0],
    ])("should %s render title when title is %s", (_desc: string, title: string, componentCount: number) => {
        const wrapper = shallow(<DashboardLayoutRowHeader title={title} />);
        expect(wrapper.find(".s-fluid-layout-row-title")).toHaveLength(componentCount);
    });

    it.each([
        ["", "description", 1],
        ["not", undefined, 0],
    ])(
        "should %s render description component when description is %s",
        (_desc: string, description: string, componentCount: number) => {
            const wrapper = shallow(<DashboardLayoutRowHeader description={description} />);
            expect(wrapper.find(DashboardLayoutRowHeaderDescription)).toHaveLength(componentCount);
        },
    );

    it("should not render custom header component when renderHeader prop is not provided", () => {
        const wrapper = shallow(<DashboardLayoutRowHeader renderHeader={undefined} />);
        expect(wrapper.find(CustomComponent)).toHaveLength(0);
    });

    it("should render custom header component when renderHeader prop is provided", () => {
        const wrapper = shallow(<DashboardLayoutRowHeader renderHeader={<CustomComponent />} />);
        expect(wrapper.find(CustomComponent)).toHaveLength(1);
    });

    it("should not render custom component before header when renderBeforeHeader prop is not provided", () => {
        const wrapper = shallow(<DashboardLayoutRowHeader renderBeforeHeader={undefined} />);
        expect(wrapper.find(CustomComponent)).toHaveLength(0);
    });

    it("should render custom component before header when renderBeforeHeader prop is provided", () => {
        const wrapper = shallow(<DashboardLayoutRowHeader renderBeforeHeader={<CustomComponent />} />);
        expect(wrapper.find(CustomComponent)).toHaveLength(1);
    });
});
