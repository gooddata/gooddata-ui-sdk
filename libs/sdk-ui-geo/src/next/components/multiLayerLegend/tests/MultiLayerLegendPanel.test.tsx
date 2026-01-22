// (C) 2025-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ILegendModel } from "../../../types/legend/model.js";
import { MultiLayerLegendPanel } from "../MultiLayerLegendPanel.js";

const mockModel: ILegendModel = {
    title: "Legend",
    sections: [
        {
            layerId: "layer-1",
            layerTitle: "Layer 1",
            layerKind: "pushpin",
            groups: [],
        },
    ],
};

describe("MultiLayerLegendPanel", () => {
    it("does not render when disabled", () => {
        const { queryByTestId } = render(<MultiLayerLegendPanel enabled={false} model={mockModel} />);

        expect(queryByTestId("gd-geo-multi-layer-legend")).toBeNull();
    });

    it("renders legend sections in reverse order (first layer on top)", () => {
        const model: ILegendModel = {
            title: "Legend",
            sections: [
                { layerId: "layer-1", layerTitle: "Layer 1", layerKind: "pushpin", groups: [] },
                { layerId: "layer-2", layerTitle: "Layer 2", layerKind: "pushpin", groups: [] },
                { layerId: "layer-3", layerTitle: "Layer 3", layerKind: "pushpin", groups: [] },
            ],
        };

        const { getByTestId } = render(<MultiLayerLegendPanel model={model} />);

        const legend = getByTestId("gd-geo-multi-layer-legend");
        const sectionNodes = Array.from(legend.querySelectorAll('[data-testid^="gd-geo-legend-section-"]'));

        expect(sectionNodes).toHaveLength(3);
        expect(sectionNodes[0]).toHaveAttribute("data-testid", "gd-geo-legend-section-layer-3");
        expect(sectionNodes[1]).toHaveAttribute("data-testid", "gd-geo-legend-section-layer-2");
        expect(sectionNodes[2]).toHaveAttribute("data-testid", "gd-geo-legend-section-layer-1");
    });

    it("does not expose clickable legend items when the layer is hidden", () => {
        const modelWithColorItems: ILegendModel = {
            title: "Legend",
            sections: [
                {
                    layerId: "layer-1",
                    layerTitle: "Layer 1",
                    layerKind: "pushpin",
                    groups: [
                        {
                            kind: "color",
                            title: "Color",
                            items: [
                                {
                                    type: "colorCategory",
                                    label: "A",
                                    color: "#ff0000",
                                    uri: "u1",
                                    isVisible: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const onItemClick = () => undefined;

        const { getByTestId } = render(
            <MultiLayerLegendPanel
                model={modelWithColorItems}
                hiddenLayers={new Set(["layer-1"])}
                onItemClick={onItemClick}
            />,
        );

        const item = getByTestId("gd-geo-legend-color-item-u1");
        expect(item).not.toHaveAttribute("role");
        expect(item).not.toHaveAttribute("tabindex");
    });
});
