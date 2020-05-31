// (C) 2020 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import PushpinCategoryLegend, { IPushpinCategoryLegendProps } from "../PushpinCategoryLegend";
import StaticLegend from "../../../../visualizations/chart/legend/StaticLegend";

function createComponent(customProps: IPushpinCategoryLegendProps): ReactWrapper {
    const legendProps = {
        ...customProps,
    };
    return mount(<PushpinCategoryLegend {...legendProps} />);
}

describe("PushpinCategoryLegend", () => {
    it("should render component", () => {
        const mockOnItemClick = jest.fn();
        const segmentData = [
            {
                name: "General Goods",
                legendIndex: 0,
                color: "rgb(20,178,226)",
                isVisible: true,
            },
            {
                name: "Toy Store",
                legendIndex: 1,
                color: "rgb(0,193,141)",
                isVisible: false,
            },
        ];
        const props: IPushpinCategoryLegendProps = {
            categoryItems: segmentData,
            position: "top",
            onItemClick: mockOnItemClick,
        };
        const wrapper = createComponent(props);
        const staticLegend = wrapper.find(StaticLegend);
        expect(wrapper.find(".viz-static-legend-wrap")).toHaveLength(1);
        expect(
            staticLegend
                .find(".series .series-name")
                .first()
                .prop("style"),
        ).toEqual({ color: "#6D7680" });
        expect(
            staticLegend
                .find(".series .series-name")
                .last()
                .prop("style"),
        ).toEqual({ color: "#CCCCCC" });
    });
});
