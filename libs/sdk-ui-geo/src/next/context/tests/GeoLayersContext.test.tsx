// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type DataViewFacade } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { ILayerPreparedData } from "../../hooks/layers/useLayersPrepare.js";
import type { GeoJSONSourceSpecification } from "../../layers/common/mapFacade.js";
import type { IGeoLayerOutput, ITooltipReferenceMaps } from "../../layers/registry/adapterTypes.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";
import { GeoLayersProvider, useGeoLayers } from "../GeoLayersContext.js";

const testSource: GeoJSONSourceSpecification = {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
};

function makePrepared(overrides: Partial<IGeoLayerOutput> = {}): ILayerPreparedData {
    return {
        layerId: "L1",
        dataView: {} as DataViewFacade,
        output: {
            source: testSource,
            legend: {
                items: [],
                available: {
                    hasCategoryLegend: false,
                    hasColorLegend: false,
                    hasSizeLegend: false,
                },
            },
            geoData: {} as IPushpinGeoData,
            colorStrategy: {} as IColorStrategy,
            initialViewport: null,
            ...overrides,
        },
    };
}

const layerExecutions: ILayerExecutionRecord[] = [
    { layerId: "L1", layer: { type: "pushpin" } as ILayerExecutionRecord["layer"] } as ILayerExecutionRecord,
];

function wrapperWith(layerOutputs: Map<string, ILayerPreparedData>) {
    return ({ children }: { children: ReactNode }) => (
        <GeoLayersProvider
            layerExecutions={layerExecutions}
            layerOutputs={layerOutputs}
            tooltipLookups={new Map()}
        >
            {children}
        </GeoLayersProvider>
    );
}

describe("GeoLayersContext", () => {
    it("propagates tooltipReferenceMaps from prepared output to IGeoLayerData", () => {
        const tooltipReferenceMaps: ITooltipReferenceMaps = {
            measures: { m_local: "f_population" },
            attributes: { "df.city": "attr.city" },
        };
        const layerOutputs = new Map([["L1", makePrepared({ tooltipReferenceMaps })]]);

        const { result } = renderHook(() => useGeoLayers(), {
            wrapper: wrapperWith(layerOutputs),
        });

        expect(result.current.layers.get("L1")?.tooltipReferenceMaps).toBe(tooltipReferenceMaps);
    });

    it("leaves tooltipReferenceMaps undefined when prepared output omits it", () => {
        const layerOutputs = new Map([["L1", makePrepared()]]);

        const { result } = renderHook(() => useGeoLayers(), {
            wrapper: wrapperWith(layerOutputs),
        });

        expect(result.current.layers.get("L1")?.tooltipReferenceMaps).toBeUndefined();
    });
});
