// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { ILegendAxisIndicatorProps, LegendAxisIndicator } from "../LegendAxisIndicator";
import { withIntl } from "@gooddata/sdk-ui";

describe("LegendAxisIndicator", () => {
    function createComponent(props: ILegendAxisIndicatorProps) {
        const Wrapped = withIntl(LegendAxisIndicator);

        return mount(<Wrapped {...props} />);
    }

    it.each([
        ["left", [], "Left:"],
        ["right", [], "Right:"],
        ["combo", ["column", "left"], "Column (Left):"],
        ["combo", ["area", "right"], "Area (Right):"],
    ])(
        "should render legend indicator when labelKey=%s",
        (labelKey: string, data: string[], expected: string) => {
            const wrapper = createComponent({ labelKey, data });
            expect(wrapper.find(".series-text").text()).toEqual(expected);
        },
    );
});
