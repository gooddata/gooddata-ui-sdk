// (C) 2026 GoodData Corporation

import { type RefObject } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IGeoChartConfig } from "../../../types/config/unified.js";
import { useMapInitialization } from "../useMapInitialization.js";

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
    return {
        map: {
            getCanvas: () => canvas,
            getCanvasContainer: () => canvas.parentElement as HTMLDivElement,
            keyboard: keyboardMock,
            remove: vi.fn(),
        },
        tooltip: {
            remove: vi.fn(),
        },
        canvas,
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
    "geochart.map.canvas.static": "Map is static. Keyboard navigation is disabled.",
};

function wrapper({ children }: { children: React.ReactNode }) {
    return (
        <IntlProvider locale="en" messages={messages}>
            {children}
        </IntlProvider>
    );
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
