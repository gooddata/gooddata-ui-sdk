// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { VisualizationTypes, withIntl } from "@gooddata/sdk-ui";
import LegendList, { LegendSeparator } from "../LegendList";
import { transformToDualAxesSeries } from "../helpers";
import LegendItem from "../LegendItem";
import noop from "lodash/noop";
import { LegendAxisIndicator } from "../LegendAxisIndicator";

describe("LegendList", () => {
    function render(customProps: any = {}) {
        const props = {
            chartType: VisualizationTypes.COLUMN,
            series: [],
            onItemClick: noop,
            containerWidth: 500,
            ...customProps,
        };

        const Wrapped = withIntl(LegendList);

        return mount(<Wrapped {...props} />);
    }

    it("should render legend items, indicators and separator", () => {
        const series = transformToDualAxesSeries(
            [
                {
                    name: "A",
                    color: "#333",
                    isVisible: true,
                    yAxis: 0,
                },
                {
                    name: "B",
                    color: "#333",
                    isVisible: true,
                    yAxis: 0,
                },
                {
                    name: "A",
                    color: "#333",
                    isVisible: true,
                    yAxis: 1,
                },
            ],
            VisualizationTypes.COLUMN,
        );

        expect(series).toHaveLength(6);

        const wrapper = render({ series });

        expect(wrapper.find(LegendItem)).toHaveLength(3);
        expect(wrapper.find(LegendSeparator)).toHaveLength(1);
        expect(wrapper.find(LegendAxisIndicator)).toHaveLength(2);
    });
    it("should render only legend items", () => {
        const series = transformToDualAxesSeries(
            [
                {
                    name: "A",
                    color: "#333",
                    isVisible: true,
                    yAxis: 1,
                },
                {
                    name: "B",
                    color: "#333",
                    isVisible: true,
                    yAxis: 1,
                },
                {
                    name: "A",
                    color: "#333",
                    isVisible: true,
                    yAxis: 1,
                },
            ],
            VisualizationTypes.COLUMN,
        );

        expect(series).toHaveLength(3);

        const wrapper = render({ series });

        expect(wrapper.find(LegendItem)).toHaveLength(3);
        expect(wrapper.find(LegendSeparator)).toHaveLength(0);
        expect(wrapper.find(LegendAxisIndicator)).toHaveLength(0);
    });
});
