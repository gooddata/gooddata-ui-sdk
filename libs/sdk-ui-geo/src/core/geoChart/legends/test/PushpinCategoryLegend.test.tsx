// (C) 2020 GoodData Corporation
import * as React from "react";
import { ContentRect } from "react-measure";
import { mount, ReactWrapper } from "enzyme";
import PushpinCategoryLegend, { IPushpinCategoryLegendProps } from "../PushpinCategoryLegend";
import { StaticLegend, FluidLegend } from "@gooddata/sdk-ui-vis-commons";

const segmentData = [
    {
        name: "General Goods",
        uri: "/gdc/md/projectId/obj/1",
        legendIndex: 0,
        color: "rgb(20,178,226)",
        isVisible: true,
    },
    {
        name: "Toy Store",
        uri: "/gdc/md/projectId/obj/2",
        legendIndex: 1,
        color: "rgb(0,193,141)",
        isVisible: false,
    },
];

function createComponent(customProps: Partial<IPushpinCategoryLegendProps> = {}): ReactWrapper {
    const contentRect: ContentRect = { client: { width: 800, height: 300, top: 0, left: 0 } };
    const legendProps = {
        categoryItems: segmentData,
        contentRect,
        hasSizeLegend: false,
        position: "left",
        responsive: false,
        showFluidLegend: false,
        ...customProps,
    };
    return mount(<PushpinCategoryLegend {...legendProps} />);
}

describe("PushpinCategoryLegend", () => {
    it("should render StaticLegend component", () => {
        const wrapper = createComponent();
        const staticLegend = wrapper.find(StaticLegend);
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

    it("should render FluidLegend component", () => {
        const wrapper = createComponent({
            responsive: true,
            showFluidLegend: true,
        });
        const fluidLegend = wrapper.find(FluidLegend);
        expect(
            fluidLegend
                .find(".series .series-name")
                .first()
                .prop("style"),
        ).toEqual({ color: "#6D7680" });
        expect(
            fluidLegend
                .find(".series .series-name")
                .last()
                .prop("style"),
        ).toEqual({ color: "#CCCCCC" });
    });
});
