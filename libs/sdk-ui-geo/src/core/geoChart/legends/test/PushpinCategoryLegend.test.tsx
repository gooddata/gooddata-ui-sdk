// (C) 2020-2023 GoodData Corporation
import React from "react";
import { ContentRect } from "react-measure";
import { render, screen } from "@testing-library/react";
import PushpinCategoryLegend, { IPushpinCategoryLegendProps } from "../PushpinCategoryLegend.js";
import { PositionType } from "@gooddata/sdk-ui-vis-commons";
import { withIntl } from "@gooddata/sdk-ui";
import { describe, it, expect } from "vitest";

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

function createComponent(customProps: Partial<IPushpinCategoryLegendProps> = {}) {
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
    return render(<Wrapped {...legendProps} />);
}

describe("PushpinCategoryLegend", () => {
    it("should render StaticLegend component", () => {
        createComponent();
        expect(screen.getByTitle("General Goods")).not.toHaveAttribute("style");
        expect(screen.getByTitle("Toy Store")).toHaveStyle("color: #CCCCCC");
    });

    it("should render FluidLegend component", () => {
        createComponent({
            responsive: true,
            isFluidLegend: true,
        });
        expect(screen.getByTitle("General Goods")).not.toHaveAttribute("style");
        expect(screen.getByTitle("Toy Store")).toHaveStyle("color: #CCCCCC");
    });

    it("should render PopUp legend component if renderPopUp is true", () => {
        const { container } = createComponent({ renderPopUp: true });
        expect(container.getElementsByClassName("legend-popup-row")).toHaveLength(1);
    });

    it("should not render PopUp legend component if renderPopUp is false", () => {
        const { container } = createComponent({ renderPopUp: false });
        expect(container.getElementsByClassName("legend-popup-row")).toHaveLength(0);
    });
});
