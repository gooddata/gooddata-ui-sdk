// (C) 2025 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ILegendModel } from "../../../types/legend/index.js";
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
