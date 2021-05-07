// (C) 2007-2019 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { mount } from "enzyme";
import { withIntl } from "@gooddata/sdk-ui";
import { ILegendProps, Legend } from "../Legend";
import { HeatmapLegend } from "../HeatmapLegend";
import { PopUpLegend } from "../PopUpLegend/PopUpLegend";

describe("Legend", () => {
    const series = [
        {
            name: "series1",
            color: "#333333",
        },
        {
            name: "series2",
            color: "#222222",
        },
        {
            name: "series3",
            color: "#111111",
        },
        {
            name: "series4",
            color: "#000000",
        },
    ];

    function createComponent(userProps: Partial<ILegendProps> = {}) {
        const props: ILegendProps = {
            enableBorderRadius: false,
            series,
            onItemClick: noop,
            validateOverHeight: noop,
            position: "top",
            contentDimensions: { width: 440, height: 440 },
            ...userProps,
        };

        const Wrapped = withIntl(Legend);

        return mount(<Wrapped {...props} />);
    }

    it("should render StaticLegend on desktop", () => {
        const legend = createComponent({
            showFluidLegend: false,
        });
        expect(legend.find(".viz-static-legend-wrap")).toHaveLength(1);
    });

    it("should render fluid legend on mobile", () => {
        const legend = createComponent({
            showFluidLegend: true,
            responsive: true,
        });
        expect(legend.find(".viz-fluid-legend-wrap")).toHaveLength(1);
    });

    it("should render heat map legend when type is heatmap", () => {
        const wrapper = createComponent({ heatmapLegend: true });
        expect(wrapper.find(HeatmapLegend).length).toEqual(1);
    });

    it("should render pop up legend when is set `autoPositionWithPopup`", () => {
        const responsiveWithPopup = "autoPositionWithPopup";
        const wrapper = createComponent({ responsive: responsiveWithPopup, maximumRows: 1 });
        expect(wrapper.find(PopUpLegend).length).toEqual(1);
    });
});
