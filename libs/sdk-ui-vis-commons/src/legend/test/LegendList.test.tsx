// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { ILegendListProps, LegendList, LegendSeparator } from "../LegendList";
import { LegendItem } from "../LegendItem";
import noop from "lodash/noop";
import { LegendAxisIndicator } from "../LegendAxisIndicator";
import { withIntl } from "@gooddata/sdk-ui";
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "../helpers";

describe("LegendList", () => {
    function render(customProps: Partial<ILegendListProps> = {}) {
        const props: ILegendListProps = {
            enableBorderRadius: false,
            series: [],
            onItemClick: noop,
            ...customProps,
        };

        const Wrapped = withIntl(LegendList);

        return mount(<Wrapped {...props} />);
    }

    it("should render legend items, indicators and separator", () => {
        const series = [
            {
                type: LEGEND_AXIS_INDICATOR,
                labelKey: "left",
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 0,
            },
            {
                type: LEGEND_SEPARATOR,
            },
            {
                name: "B",
                color: "#333",
                isVisible: true,
                yAxis: 0,
            },
            {
                type: LEGEND_AXIS_INDICATOR,
                labelKey: "right",
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
                yAxis: 1,
            },
        ];

        expect(series).toHaveLength(6);

        const wrapper = render({ series });

        expect(wrapper.find(LegendItem)).toHaveLength(3);
        expect(wrapper.find(LegendSeparator)).toHaveLength(1);
        expect(wrapper.find(LegendAxisIndicator)).toHaveLength(2);
    });
});
