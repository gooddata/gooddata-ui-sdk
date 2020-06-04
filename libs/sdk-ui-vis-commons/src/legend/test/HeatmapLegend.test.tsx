// (C) 2007-2020 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { HeatmapLegend, IHeatmapLegendProps } from "../HeatmapLegend";

describe("HeatmapLegend", () => {
    const numericSymbols = ["k", "M", "G"];
    function renderLegend(props: IHeatmapLegendProps): ReactWrapper {
        return mount(<HeatmapLegend {...props} />);
    }

    it("should render legend", () => {
        const series = [
            {
                color: "abc",
                legendIndex: 0,
                range: {
                    from: 1,
                    to: 2,
                },
            },
            {
                color: "def",
                legendIndex: 1,
                range: {
                    from: 4,
                    to: 5,
                },
            },
        ];
        const wrapper = renderLegend({ series, numericSymbols, isSmall: false, position: "top" });

        expect(wrapper.find(".color-legend").length).toEqual(1);
    });
});
