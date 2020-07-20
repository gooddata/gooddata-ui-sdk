// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";

import { VisualizationTypes, withIntl } from "@gooddata/sdk-ui";
import StaticLegend from "../StaticLegend";
import LegendItem from "../LegendItem";

describe("StaticLegend", () => {
    function render(customProps: any = {}) {
        const props = {
            chartType: VisualizationTypes.BAR,
            series: [],
            onItemClick: noop,
            position: "top",
            containerHeight: 500,
            locale: "en-US",
            ...customProps,
        };
        const Wrapped = withIntl(StaticLegend);

        return mount(<Wrapped {...props} />);
    }

    it("should render items", () => {
        const series = [
            {
                name: "A",
                color: "#333",
                isVisible: true,
            },
            {
                name: "B",
                color: "#333",
                isVisible: true,
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
            },
        ];

        const topLegend = render({ series, position: "top" });
        expect(topLegend.find(LegendItem)).toHaveLength(3);

        const rightLegend = render({ series, position: "right" });
        expect(rightLegend.find(LegendItem)).toHaveLength(3);
    });
});
