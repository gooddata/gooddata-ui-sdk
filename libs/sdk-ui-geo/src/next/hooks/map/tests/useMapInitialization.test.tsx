// (C) 2026 GoodData Corporation

import { type RefObject } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { type ContentRect } from "react-measure";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IMapFacade, type StyleSpecification } from "../../../layers/common/mapFacade.js";
import { type IGeoChartConfig } from "../../../types/config/unified.js";
import { useMapInitialization } from "../useMapInitialization.js";
import { useMapResize } from "../useMapResize.js";

// Minimal keyboard handler mock matching MapLibre's KeyboardHandler API
function createKeyboardHandlerMock() {
    return {
        enable: vi.fn(),
        disable: vi.fn(),
        disableRotation: vi.fn(),
    };
}

function createMapInstanceMock(keyboardMock: ReturnType<typeof createKeyboardHandlerMock>) {
    const canvas = document.createElement("canvas");
    const center = { lng: 14.42, lat: 50.08 };
    const zoom = 7;
    return {
        map: {
            getCanvas: () => canvas,
            getCanvasContainer: () => canvas.parentElement as HTMLDivElement,
            getCenter: () => center,
            getZoom: () => zoom,
            keyboard: keyboardMock,
            remove: vi.fn(),
        },
        tooltip: {
            remove: vi.fn(),
        },
        canvas,
        center,
        zoom,
    };
}

const initMock = vi.fn();

vi.mock("../../../map/runtime/mapInitialization.js", () => ({
    initializeMapLibreMap: (...args: unknown[]) => initMock(...args),
}));

vi.mock("../../../utils/mapLocale.js", () => ({
    generateMapLibreLocale: () => undefined,
}));

const messages: Record<string, string> = {
    "geochart.map.canvas.label": "GeoChart: {title} map canvas",
    "geochart.map.canvas.label.fallback": "GeoChart map canvas",
    "geochart.map.canvas.instructions.panZoom":
        "Map canvas. Use arrow keys to pan. Use plus and minus to zoom. Press Tab to move to the next control.",
    "geochart.map.canvas.instructions.zoomOnly":
        "Map canvas. Use plus and minus to zoom. Press Tab to move to the next control.",
    "geochart.map.canvas.static": "Map is static. Keyboard navigation is disabled.",
};

function wrapper({ children }: { children: React.ReactNode }) {
    return (
        <IntlProvider locale="en" messages={messages}>
            {children}
        </IntlProvider>
    );
}

function createResizeMapMock(): IMapFacade {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const style: StyleSpecification = { version: 8, sources: {}, layers: [] };
    const center: ReturnType<IMapFacade["getCenter"]> = {
        lat: 0,
        lng: 0,
        wrap: () => center,
        toArray: () => [0, 0] as [number, number],
        distanceTo: () => 0,
    };

    const map = {
        isStyleLoaded: vi.fn(() => true),
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
        cameraForBounds: vi.fn(() => ({ center: [0, 0] as [number, number], zoom: 3 })),
        flyTo: vi.fn(() => map),
        jumpTo: vi.fn(() => map),
        panTo: vi.fn(() => map),
        zoomTo: vi.fn(() => map),
        getCenter: vi.fn(() => center),
        getZoom: vi.fn(() => 3),
        getStyle: vi.fn(() => style),
        getCanvas: vi.fn(() => canvas),
        loaded: vi.fn(() => true),
        areTilesLoaded: vi.fn(() => true),
        queryRenderedFeatures: vi.fn(() => []),
        setLayoutProperty: vi.fn(() => map),
        setFilter: vi.fn(() => map),
        keyboard: {
            enable: vi.fn(),
            disable: vi.fn(),
            disableRotation: vi.fn(),
        },
    };

    return map;
}

describe("useMapInitialization a11y", () => {
    let keyboardMock: ReturnType<typeof createKeyboardHandlerMock>;
    let mapMock: ReturnType<typeof createMapInstanceMock>;
    let containerRef: RefObject<HTMLDivElement | null>;
    let legendPanelRef: RefObject<HTMLDivElement | null>;
    const enabledA11yConfig: IGeoChartConfig = { enableGeoChartA11yImprovements: true };

    beforeEach(() => {
        keyboardMock = createKeyboardHandlerMock();
        mapMock = createMapInstanceMock(keyboardMock);
        containerRef = { current: document.createElement("div") } as RefObject<HTMLDivElement | null>;
        legendPanelRef = { current: null } as RefObject<HTMLDivElement | null>;

        initMock.mockReset();
        initMock.mockResolvedValue({ map: mapMock.map, tooltip: mapMock.tooltip, maplibregl: {} });
    });

    it("sets tabIndex=0 on the canvas after initialization", async () => {
        renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "instructions-id"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });
    });

    it("sets fallback aria-label on the canvas when a11y title is not provided", async () => {
        renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "instructions-id"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.getAttribute("aria-label")).toBe("GeoChart map canvas");
        });
    });

    it("sets title-aware aria-label on the canvas when a11y title is provided", async () => {
        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    enabledA11yConfig,
                    null,
                    undefined,
                    "instructions-id",
                    "Revenue map",
                ),
            { wrapper },
        );

        await waitFor(() => {
            expect(mapMock.canvas.getAttribute("aria-label")).toBe("GeoChart: Revenue map map canvas");
        });
    });

    it("sets aria-describedby when mapInstructionsId is provided", async () => {
        renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "my-instructions"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.getAttribute("aria-describedby")).toBe("my-instructions");
        });
    });

    it("does not set aria-describedby when mapInstructionsId is not provided", async () => {
        renderHook(() => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, undefined), {
            wrapper,
        });

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });
        expect(mapMock.canvas.getAttribute("aria-describedby")).toBeNull();
    });

    it("keeps legend before map canvas and removes MapLibre control tab stops", async () => {
        const canvasContainer = document.createElement("div");
        canvasContainer.className = "maplibregl-canvas-container";
        canvasContainer.appendChild(mapMock.canvas);

        const controlContainer = document.createElement("div");
        controlContainer.className = "maplibregl-control-container";
        const attributionToggle = document.createElement("summary");
        attributionToggle.className = "maplibregl-ctrl-attrib-button";
        attributionToggle.tabIndex = 0;
        const attributionLink = document.createElement("a");
        attributionLink.href = "#";
        attributionLink.tabIndex = 0;
        controlContainer.append(attributionToggle, attributionLink);

        const legend = document.createElement("div");
        legend.className = "gd-geo-multi-layer-legend";
        legendPanelRef.current = legend;

        containerRef.current!.append(canvasContainer, controlContainer, legend);

        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    enabledA11yConfig,
                    null,
                    undefined,
                    "instructions-id",
                    undefined,
                    legendPanelRef,
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(containerRef.current?.firstElementChild).toBe(legend);
        });
        expect(attributionToggle.tabIndex).toBe(-1);
        expect(attributionLink.tabIndex).toBe(-1);
    });

    it("reorders legend when it is added after map initialization", async () => {
        const canvasContainer = document.createElement("div");
        canvasContainer.className = "maplibregl-canvas-container";
        canvasContainer.appendChild(mapMock.canvas);

        containerRef.current!.append(canvasContainer);

        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    enabledA11yConfig,
                    null,
                    undefined,
                    "instructions-id",
                    undefined,
                    legendPanelRef,
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        const legend = document.createElement("div");
        legend.className = "gd-geo-multi-layer-legend";
        legendPanelRef.current = legend;
        containerRef.current!.appendChild(legend);

        await waitFor(() => {
            expect(containerRef.current?.firstElementChild).toBe(legend);
        });
    });

    it("does not keep reordering when legend is already before map canvas", async () => {
        const legend = document.createElement("div");
        legend.className = "gd-geo-multi-layer-legend";
        legendPanelRef.current = legend;

        const canvasContainer = document.createElement("div");
        canvasContainer.className = "maplibregl-canvas-container";
        canvasContainer.appendChild(mapMock.canvas);

        containerRef.current!.append(legend, canvasContainer);
        const insertBeforeSpy = vi.spyOn(containerRef.current!, "insertBefore");

        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    enabledA11yConfig,
                    null,
                    undefined,
                    "instructions-id",
                    undefined,
                    legendPanelRef,
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        act(() => {
            containerRef.current!.appendChild(document.createElement("div"));
        });

        await waitFor(() => {
            expect(insertBeforeSpy).not.toHaveBeenCalled();
        });
    });

    it("disables keyboard by default after initialization", async () => {
        renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "instructions-id"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(keyboardMock.disable).toHaveBeenCalled();
        });
    });

    it("passes effective interaction options to map initialization", async () => {
        renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "instructions-id"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalled();
        });

        const [options] = initMock.mock.calls[0];
        expect(options.interactive).toBe(true);
        expect(options.dragRotate).toBeUndefined();
        expect(options.pitchWithRotate).toBeUndefined();
        expect(options.touchZoomRotate).toBeUndefined();
    });

    it("passes public basemap style params to runtime without internal basemap FF", async () => {
        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    {
                        enableGeoChartA11yImprovements: true,
                        basemap: "standard",
                        colorScheme: "dark",
                    },
                    null,
                    undefined,
                    "instructions-id",
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalled();
        });

        const [options] = initMock.mock.calls[0];
        expect(options.basemap).toBe("standard");
        expect(options.colorScheme).toBe("dark");
    });

    it("ignores colorScheme when basemap is not specified", async () => {
        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    {
                        enableGeoChartA11yImprovements: true,
                        colorScheme: "dark",
                    },
                    null,
                    undefined,
                    "instructions-id",
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalled();
        });

        const [options] = initMock.mock.calls[0];
        expect(options.basemap).toBeUndefined();
        expect(options.colorScheme).toBeUndefined();
    });

    it("ignores explicit default colorScheme when basemap is not specified", async () => {
        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    {
                        enableGeoChartA11yImprovements: true,
                    },
                    null,
                    undefined,
                    "instructions-id",
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalled();
        });

        const [options] = initMock.mock.calls[0];
        expect(options.basemap).toBeUndefined();
        expect(options.colorScheme).toBeUndefined();
    });

    it("ignores colorScheme in runtime when selected basemap does not support it", async () => {
        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    {
                        enableGeoChartA11yImprovements: true,
                        basemap: "none",
                        colorScheme: "dark",
                    },
                    null,
                    undefined,
                    "instructions-id",
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalled();
        });

        const [options] = initMock.mock.calls[0];
        expect(options.basemap).toBe("none");
        expect(options.colorScheme).toBeUndefined();
    });

    it("ignores colorScheme in runtime for hybrid basemap", async () => {
        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    {
                        enableGeoChartA11yImprovements: true,
                        basemap: "hybrid",
                        colorScheme: "dark",
                    },
                    null,
                    undefined,
                    "instructions-id",
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalled();
        });

        const [options] = initMock.mock.calls[0];
        expect(options.basemap).toBe("hybrid");
        expect(options.colorScheme).toBeUndefined();
    });

    it("enables keyboard and disables rotation on canvas focus for interactive maps", async () => {
        renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "instructions-id"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        keyboardMock.enable.mockClear();
        keyboardMock.disableRotation.mockClear();

        act(() => {
            mapMock.canvas.dispatchEvent(new FocusEvent("focus"));
        });

        expect(keyboardMock.enable).toHaveBeenCalledTimes(1);
        expect(keyboardMock.disableRotation).toHaveBeenCalledTimes(1);
    });

    it("blocks arrow-key pan when viewport navigation disables pan", async () => {
        const noPanNavigationConfig: IGeoChartConfig = {
            enableGeoChartA11yImprovements: true,
            enableGeoChartsViewportConfig: true,
            applyViewportNavigation: true,
            viewport: {
                navigation: {
                    pan: false,
                    zoom: true,
                },
            },
        };

        renderHook(
            () =>
                useMapInitialization(containerRef, noPanNavigationConfig, null, undefined, "instructions-id"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        keyboardMock.enable.mockClear();
        act(() => {
            mapMock.canvas.dispatchEvent(new FocusEvent("focus"));
        });
        expect(keyboardMock.enable).toHaveBeenCalledTimes(1);

        const arrowLeftEvent = new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true });
        const dispatchResult = mapMock.canvas.dispatchEvent(arrowLeftEvent);

        expect(dispatchResult).toBe(false);
        expect(arrowLeftEvent.defaultPrevented).toBe(true);
    });

    it("blocks plus/minus zoom keys when viewport navigation disables zoom", async () => {
        const noZoomNavigationConfig: IGeoChartConfig = {
            enableGeoChartA11yImprovements: true,
            enableGeoChartsViewportConfig: true,
            applyViewportNavigation: true,
            viewport: {
                navigation: {
                    pan: true,
                    zoom: false,
                },
            },
        };

        renderHook(
            () =>
                useMapInitialization(
                    containerRef,
                    noZoomNavigationConfig,
                    null,
                    undefined,
                    "instructions-id",
                ),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        keyboardMock.enable.mockClear();
        act(() => {
            mapMock.canvas.dispatchEvent(new FocusEvent("focus"));
        });
        expect(keyboardMock.enable).toHaveBeenCalledTimes(1);

        const plusEvent = new KeyboardEvent("keydown", { key: "+", cancelable: true });
        const dispatchResult = mapMock.canvas.dispatchEvent(plusEvent);

        expect(dispatchResult).toBe(false);
        expect(plusEvent.defaultPrevented).toBe(true);
    });

    it("re-initializes map with updated navigation settings after config rerender", async () => {
        const noPanNavigationConfig: IGeoChartConfig = {
            enableGeoChartA11yImprovements: true,
            enableGeoChartsViewportConfig: true,
            applyViewportNavigation: true,
            viewport: {
                navigation: {
                    pan: false,
                    zoom: true,
                },
            },
        };
        const panEnabledNavigationConfig: IGeoChartConfig = {
            ...noPanNavigationConfig,
            viewport: {
                navigation: {
                    pan: true,
                    zoom: true,
                },
            },
        };

        const { rerender } = renderHook(
            ({ config }: { config: IGeoChartConfig }) =>
                useMapInitialization(containerRef, config, null, undefined, "instructions-id"),
            {
                wrapper,
                initialProps: { config: noPanNavigationConfig },
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalledTimes(1);
        });
        expect(initMock.mock.calls[0][0].navigation).toEqual({
            pan: false,
            zoom: true,
        });

        rerender({ config: panEnabledNavigationConfig });

        await waitFor(() => {
            expect(initMock).toHaveBeenCalledTimes(2);
        });
        expect(initMock.mock.calls[1][0].navigation).toEqual({
            pan: true,
            zoom: true,
        });
    });

    it("preserves current center and zoom when re-initializing after basemap change", async () => {
        const standardConfig: IGeoChartConfig = {
            enableGeoChartA11yImprovements: true,
            basemap: "standard",
        };
        const monochromeConfig: IGeoChartConfig = {
            ...standardConfig,
            basemap: "monochrome",
        };
        const selectedPresetViewport = {
            bounds: {
                southWest: { lng: 112, lat: -44 },
                northEast: { lng: 154, lat: -10 },
            },
        };

        const { rerender } = renderHook(
            ({ config }: { config: IGeoChartConfig }) =>
                useMapInitialization(
                    containerRef,
                    config,
                    selectedPresetViewport,
                    undefined,
                    "instructions-id",
                ),
            {
                wrapper,
                initialProps: { config: standardConfig },
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalledTimes(1);
        });
        expect(initMock.mock.calls[0][0].bounds).toEqual(selectedPresetViewport.bounds);

        rerender({ config: monochromeConfig });

        await waitFor(() => {
            expect(initMock).toHaveBeenCalledTimes(2);
        });

        expect(initMock.mock.calls[1][0].center).toEqual(mapMock.center);
        expect(initMock.mock.calls[1][0].zoom).toBe(mapMock.zoom);
        expect(initMock.mock.calls[1][0].bounds).toBeUndefined();
    });

    it("does not re-initialize the map when config object identity changes but requested viewport stays the same", async () => {
        const baseConfig: IGeoChartConfig = {
            enableGeoChartA11yImprovements: true,
            center: { lng: 11, lat: 49 },
            zoom: 6,
        };

        const { rerender } = renderHook(
            ({ config }: { config: IGeoChartConfig }) =>
                useMapInitialization(containerRef, config, null, undefined, "instructions-id"),
            {
                wrapper,
                initialProps: { config: baseConfig },
            },
        );

        await waitFor(() => {
            expect(initMock).toHaveBeenCalledTimes(1);
        });

        rerender({
            config: {
                ...baseConfig,
                center: { ...baseConfig.center! },
            },
        });

        await waitFor(() => {
            expect(initMock).toHaveBeenCalledTimes(1);
        });
    });

    it("disables keyboard on canvas blur", async () => {
        renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "instructions-id"),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        keyboardMock.disable.mockClear();

        act(() => {
            mapMock.canvas.dispatchEvent(new FocusEvent("blur"));
        });

        expect(keyboardMock.disable).toHaveBeenCalledTimes(1);
    });

    it("does not enable keyboard on focus when viewport is frozen", async () => {
        const frozenConfig: IGeoChartConfig = {
            enableGeoChartA11yImprovements: true,
            viewport: { frozen: true },
        };

        renderHook(
            () => useMapInitialization(containerRef, frozenConfig, null, undefined, "instructions-id"),
            { wrapper },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        keyboardMock.enable.mockClear();

        act(() => {
            mapMock.canvas.dispatchEvent(new FocusEvent("focus"));
        });

        expect(keyboardMock.enable).not.toHaveBeenCalled();
    });

    it("removes focus/blur event listeners on unmount", async () => {
        const removeEventListenerSpy = vi.spyOn(mapMock.canvas, "removeEventListener");

        const { unmount } = renderHook(
            () => useMapInitialization(containerRef, enabledA11yConfig, null, undefined, "instructions-id"),
            { wrapper },
        );

        await waitFor(() => {
            expect(mapMock.canvas.tabIndex).toBe(0);
        });

        unmount();

        const removedEvents = removeEventListenerSpy.mock.calls.map((call) => call[0]);
        expect(removedEvents).toContain("focus");
        expect(removedEvents).toContain("blur");
    });

    it("ignores queued MutationObserver callback after unmount cleanup", async () => {
        const createdObservers: Array<{
            observe: ReturnType<typeof vi.fn>;
            disconnect: ReturnType<typeof vi.fn>;
            takeRecords: ReturnType<typeof vi.fn>;
            trigger: () => void;
        }> = [];

        const OriginalMutationObserver = globalThis.MutationObserver;

        class MockMutationObserver {
            public observe = vi.fn();
            public disconnect = vi.fn();
            public takeRecords = vi.fn(() => []);

            public constructor(private readonly callback: MutationCallback) {
                createdObservers.push({
                    observe: this.observe,
                    disconnect: this.disconnect,
                    takeRecords: this.takeRecords,
                    trigger: () => this.callback([], this as unknown as MutationObserver),
                });
            }
        }

        (globalThis as unknown as { MutationObserver: typeof MutationObserver }).MutationObserver =
            MockMutationObserver as unknown as typeof MutationObserver;

        try {
            const getCanvasSpy = vi.spyOn(mapMock.map, "getCanvas");

            const { unmount } = renderHook(
                () =>
                    useMapInitialization(
                        containerRef,
                        enabledA11yConfig,
                        null,
                        undefined,
                        "instructions-id",
                        undefined,
                        legendPanelRef,
                    ),
                { wrapper },
            );

            await waitFor(() => {
                expect(createdObservers.length).toBeGreaterThan(0);
                expect(mapMock.canvas.tabIndex).toBe(0);
            });

            const observer = createdObservers[createdObservers.length - 1];

            unmount();

            expect(observer.takeRecords).toHaveBeenCalledTimes(1);
            expect(observer.disconnect).toHaveBeenCalledTimes(1);

            getCanvasSpy.mockClear();
            act(() => {
                observer.trigger();
            });

            expect(getCanvasSpy).not.toHaveBeenCalled();
        } finally {
            (globalThis as unknown as { MutationObserver: typeof MutationObserver }).MutationObserver =
                OriginalMutationObserver;
        }
    });
});

describe("useMapResize", () => {
    it("does not reapply the same viewport when only the map instance changes", async () => {
        const firstMap = createResizeMapMock();
        const recreatedMap = createResizeMapMock();
        const chartContainerRect = {
            client: {
                width: 400,
                height: 300,
            },
        } as ContentRect;
        const viewport = {
            bounds: {
                southWest: { lng: 10, lat: 20 },
                northEast: { lng: 30, lat: 40 },
            },
        };

        const { rerender } = renderHook(
            ({ map }: { map: IMapFacade }) =>
                useMapResize(map, true, chartContainerRect, viewport, null, undefined),
            {
                initialProps: { map: firstMap },
            },
        );

        await waitFor(() => {
            expect(firstMap.jumpTo).toHaveBeenCalledTimes(1);
        });

        rerender({ map: recreatedMap });

        await waitFor(() => {
            expect(recreatedMap.jumpTo).not.toHaveBeenCalled();
            expect(recreatedMap.resize).not.toHaveBeenCalled();
        });
    });
});
