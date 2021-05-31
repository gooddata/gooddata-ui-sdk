// (C) 2020 GoodData Corporation
import React from "react";
import { ContentRect } from "react-measure";
import { mount, ReactWrapper } from "enzyme";
import PushpinCategoryLegend, { IPushpinCategoryLegendProps } from "../PushpinCategoryLegend";
import { StaticLegend, FluidLegend, PositionType, PopUpLegend } from "@gooddata/sdk-ui-vis-commons";
import { withIntl } from "@gooddata/sdk-ui";

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
    const position: PositionType = "left";
    const legendProps = {
        categoryItems: segmentData,
        contentRect,
        hasSizeLegend: false,
        position,
        responsive: false,
        showFluidLegend: false,
        containerId: "id",
        ...customProps,
    };
    const Wrapped = withIntl(PushpinCategoryLegend);
    return mount(<Wrapped {...legendProps} />);
}

describe("PushpinCategoryLegend", () => {
    it("should render StaticLegend component", () => {
        const wrapper = createComponent();
        const staticLegend = wrapper.find(StaticLegend);
        expect(staticLegend.find(".series .series-name").first().prop("style")).toEqual({});
        expect(staticLegend.find(".series .series-name").last().prop("style")).toEqual({ color: "#CCCCCC" });
    });

    it("should render FluidLegend component", () => {
        const wrapper = createComponent({
            responsive: true,
            isFluidLegend: true,
        });
        const fluidLegend = wrapper.find(FluidLegend);
        expect(fluidLegend.find(".series .series-name").first().prop("style")).toEqual({});
        expect(fluidLegend.find(".series .series-name").last().prop("style")).toEqual({ color: "#CCCCCC" });
    });

    it("should render PopUp legend component if renderPopUp is true", () => {
        const wrapper = createComponent({ renderPopUp: true });
        expect(wrapper.find(PopUpLegend).exists()).toBe(true);
    });

    it("should render PopUp legend component with correct maxRows prop when Size legend shown too", () => {
        const wrapper = createComponent({ renderPopUp: true, hasSizeLegend: true, maxRows: 2 });
        const popupLegend = wrapper.find(PopUpLegend);
        expect(popupLegend.prop("maxRows")).toBe(1);
    });

    it("should not render PopUp legend component if renderPopUp is false", () => {
        const wrapper = createComponent({ renderPopUp: false });
        expect(wrapper.find(PopUpLegend).exists()).toBe(false);
    });
});
