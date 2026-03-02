// (C) 2026 GoodData Corporation

import { type MutableRefObject, createRef } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IColorPalette } from "@gooddata/sdk-model";

import type { IGeoLayerData } from "../../../context/GeoLayersContext.js";
import type { IGeoAdapterContext } from "../../../layers/registry/adapterTypes.js";
import type { ILayerExecutionRecord } from "../../../types/props/geoChart/internal.js";
import { useUpdateLayersOnMap } from "../useUpdateLayersOnMap.js";

const adapterMock = {
    getMapUpdateKey: vi.fn((_layer, context: IGeoAdapterContext) => context.colorPalette?.[0]?.guid ?? ""),
    updateOnMap: vi.fn(),
};

vi.mock("../../../layers/registry/adapterRegistry.js", () => ({
    getLayerAdapter: () => adapterMock,
}));

const paletteA: IColorPalette = [{ guid: "palette-a", fill: { r: 1, g: 2, b: 3 } }];
const paletteB: IColorPalette = [{ guid: "palette-b", fill: { r: 9, g: 8, b: 7 } }];

const layerExecutions: ILayerExecutionRecord[] = [
    {
        layerId: "area-layer",
        layer: {
            id: "area-layer",
            type: "area",
            area: {} as never,
        },
        execution: {} as never,
    },
];

const layers = new Map<string, IGeoLayerData>([
    [
        "area-layer",
        {
            layerId: "area-layer",
            layerType: "area",
            source: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
            geoData: {
                area: { name: "Area", index: 0, data: [], uris: [] },
            } as unknown as IGeoLayerData["geoData"],
            dataView: {} as IGeoLayerData["dataView"],
            colorStrategy: {
                getColorByIndex: () => "#111111",
                getColorAssignment: () => [],
                getFullColorAssignment: () => [],
            },
            baseLegendItems: [],
            availableLegends: { hasCategoryLegend: false, hasColorLegend: false, hasSizeLegend: false },
            initialViewport: null,
        },
    ],
]);

function TestUpdateHook({
    adapterContextRef,
    mapUpdateKey,
}: {
    adapterContextRef: MutableRefObject<IGeoAdapterContext>;
    mapUpdateKey: string;
}) {
    useUpdateLayersOnMap({
        map: {} as never,
        isMapReady: true,
        layerExecutions,
        layers,
        adapterContextRef,
        mapUpdateKey,
    });
    return null;
}

describe("useUpdateLayersOnMap", () => {
    it("triggers in-place update when chart-level palette changes", () => {
        const adapterContextRef = createRef<IGeoAdapterContext>() as MutableRefObject<IGeoAdapterContext>;
        adapterContextRef.current = {
            backend: {} as never,
            workspace: "workspace",
            config: { colorPalette: paletteA },
        };

        const { rerender } = render(
            <TestUpdateHook adapterContextRef={adapterContextRef} mapUpdateKey="color-key-a" />,
        );

        expect(adapterMock.updateOnMap).not.toHaveBeenCalled();

        adapterContextRef.current = {
            ...adapterContextRef.current,
            config: { colorPalette: paletteB },
        };

        rerender(<TestUpdateHook adapterContextRef={adapterContextRef} mapUpdateKey="color-key-b" />);

        expect(adapterMock.updateOnMap).toHaveBeenCalledTimes(1);
    });
});
