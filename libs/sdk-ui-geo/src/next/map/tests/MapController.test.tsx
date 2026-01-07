// (C) 2025-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import type { IGeoLayersContext } from "../../context/GeoLayersContext.js";
import type { IMapFacade, IPopupFacade, StyleSpecification } from "../../layers/common/mapFacade.js";
import type { IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";
import { type IGeoLayer } from "../../types/layers/index.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";
import { MapController } from "../MapController.js";

const initMock = vi.fn();
const resizeMock = vi.fn();
const callbacksMock = vi.fn();
const syncMock = vi.fn();
const afterRenderMock = vi.fn();
const applyViewportOnConfigChangeMock = vi.fn();

function createMapFacadeStub(): IMapFacade {
    const style: StyleSpecification = { version: 8, sources: {}, layers: [] };
    const map: IMapFacade = {
        isStyleLoaded: () => true,
        once: vi.fn(() => map),
        on: vi.fn(() => map),
        off: vi.fn(() => map),
        addSource: vi.fn(() => map),
        addLayer: vi.fn(() => map),
        getLayer: vi.fn(() => undefined),
        getSource: vi.fn(() => undefined),
        removeLayer: vi.fn(() => map),
        removeSource: vi.fn(() => map),
        resize: vi.fn(() => map),
        cameraForBounds: vi.fn(() => ({ center: [0, 0] as [number, number], zoom: 1 })),
        flyTo: vi.fn(() => map),
        jumpTo: vi.fn(() => map),
        panTo: vi.fn(() => map),
        zoomTo: vi.fn(() => map),
        getCenter: vi.fn((): ReturnType<IMapFacade["getCenter"]> => {
            const center: ReturnType<IMapFacade["getCenter"]> = {
                lat: 0,
                lng: 0,
                wrap: () => center,
                toArray: () => [0, 0] as [number, number],
                distanceTo: () => 0,
            } as ReturnType<IMapFacade["getCenter"]>;
            return center;
        }),
        getZoom: vi.fn(() => 1),
        getStyle: vi.fn(() => style),
        getCanvas: vi.fn(() => document.createElement("canvas")),
        loaded: vi.fn(() => true),
        areTilesLoaded: vi.fn(() => true),
        queryRenderedFeatures: vi.fn(() => []),
        setLayoutProperty: vi.fn(() => map),
        setFilter: vi.fn(() => map),
    };
    return map;
}

function createPopupFacadeStub(): IPopupFacade {
    const popup: IPopupFacade = {
        setLngLat: () => popup,
        setHTML: () => popup,
        setMaxWidth: () => popup,
        addTo: () => popup,
        remove: vi.fn(),
        isOpen: () => true,
    };
    return popup;
}

const mapFacadeStub = createMapFacadeStub();
const popupFacadeStub = createPopupFacadeStub();

const geoLayersContextMock: IGeoLayersContext = {
    layerExecutions: [],
    layers: new Map(),
    primaryLayer: null,
    colorPalette: [],
};

const adapterContextMock: IGeoAdapterContext = {
    backend: {} as any,
    workspace: "workspace-id",
    config: {},
    execConfig: {},
    colorPalette: [],
    colorMapping: [],
    intl: {} as any,
};

vi.mock("../../hooks/map/useMapInitialization.js", () => ({
    useMapInitialization: (...args: unknown[]) =>
        initMock(...args) || { map: mapFacadeStub, tooltip: popupFacadeStub, isMapReady: true },
}));
vi.mock("../../hooks/map/useMapResize.js", () => ({
    useMapResize: (...args: unknown[]) => resizeMock(...args),
}));
vi.mock("../../hooks/map/useMapCallbacks.js", () => ({
    useMapCallbacks: (...args: unknown[]) => callbacksMock(...args),
}));
vi.mock("../../hooks/layers/useSyncLayersToMap.js", () => ({
    useSyncLayersToMap: (...args: unknown[]) => syncMock(...args),
}));
vi.mock("../../context/GeoLayersContext.js", () => ({
    useGeoLayers: () => geoLayersContextMock,
}));
vi.mock("../../hooks/layers/useGeoAdapterContext.js", () => ({
    useGeoAdapterContext: () => adapterContextMock,
}));
vi.mock("../../hooks/map/useAfterRender.js", () => ({
    useAfterRender: (...args: unknown[]) => afterRenderMock(...args),
}));
vi.mock("../../hooks/map/useApplyViewportOnConfigChange.js", () => ({
    useApplyViewportOnConfigChange: (...args: unknown[]) => applyViewportOnConfigChangeMock(...args),
}));

describe("MapController", () => {
    beforeEach(() => {
        initMock.mockClear();
        resizeMock.mockClear();
        callbacksMock.mockClear();
        syncMock.mockClear();
        afterRenderMock.mockClear();
        applyViewportOnConfigChangeMock.mockClear();
    });

    it("wires map lifecycle hooks with provided props", () => {
        const mapContainerRef = { current: document.createElement("div") };
        const config = undefined;
        const layerExecutions: ILayerExecutionRecord<IGeoLayer>[] = [];
        const drillablePredicates: IHeaderPredicate[] = [];
        const afterRender = vi.fn();
        const onCenterPositionChanged = vi.fn();
        const onZoomChanged = vi.fn();

        geoLayersContextMock.layerExecutions = layerExecutions;

        render(
            <MapController
                mapContainerRef={mapContainerRef}
                chartContainerRect={null}
                initialViewport={null}
                dataViewport={null}
                layerExecutions={layerExecutions}
                drillablePredicates={drillablePredicates}
                onCenterPositionChanged={onCenterPositionChanged}
                onZoomChanged={onZoomChanged}
                afterRender={afterRender}
                config={config}
            />,
        );

        expect(initMock).toHaveBeenCalledWith(mapContainerRef, config, null, undefined);
        expect(resizeMock).toHaveBeenCalledWith(mapFacadeStub, true, null, null);
        expect(applyViewportOnConfigChangeMock).toHaveBeenCalledWith(mapFacadeStub, true, config, null);
        expect(callbacksMock).toHaveBeenCalledWith(mapFacadeStub, {
            onCenterPositionChanged,
            onZoomChanged,
        });
        expect(syncMock).toHaveBeenCalledWith({
            drillablePredicates,
        });
        expect(afterRenderMock).toHaveBeenCalledWith(mapFacadeStub, afterRender, layerExecutions);
    });
});
