// (C) 2007-2019 GoodData Corporation
import React from "react";
import { shallow, mount } from "enzyme";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper";

describe("DateFilterFormWrapper", () => {
    it("should render children", () => {
        const Content = <div>content</div>;
        const wrapper = shallow(<DateFilterFormWrapper isMobile={false}>{Content}</DateFilterFormWrapper>);
        expect(wrapper.contains(Content)).toEqual(true);
    });

    it("should correctly propagate className to wrapper", () => {
        const className = "foo";
        const wrapper = shallow(
            <DateFilterFormWrapper isMobile={false} className={className}>
                content
            </DateFilterFormWrapper>,
        );
        expect(wrapper.hasClass(className)).toEqual(true);
    });

    it("should match snapshot", () => {
        const component = (
            <DateFilterFormWrapper isMobile={false} className="foo">
                content
            </DateFilterFormWrapper>
        );
        expect(mount(component).html()).toMatchSnapshot();
    });
});
