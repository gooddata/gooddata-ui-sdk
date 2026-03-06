// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StyleSpecification } from "../../../layers/common/mapFacade.js";
import { initializeMapLibreMap } from "../mapInitialization.js";

type IMapConstructorOptions = {
    renderWorldCopies?: boolean;
    maxZoom?: number;
    bounds?: [[number, number], [number, number]];
    dragPan?: boolean;
    scrollZoom?: boolean;
    doubleClickZoom?: boolean;
    boxZoom?: boolean;
    touchZoomRotate?: boolean;
    keyboard?: boolean;
};

type IMapEventPayload = {
    error?: {
        message?: string;
    };
};

type IMapEventHandler = (payload?: IMapEventPayload) => void;

let lastMapOptions: IMapConstructorOptions | undefined;
const disableRotationMock = vi.fn();

class MockMap {
    public readonly touchZoomRotate = {
        disableRotation: disableRotationMock,
    };

    private readonly listeners: Record<string, IMapEventHandler[]> = {};

    public constructor(options: IMapConstructorOptions) {
        lastMapOptions = options;
    }

    public loaded(): boolean {
        return true;
    }

    public isStyleLoaded(): boolean {
        return true;
    }

    public on(event: string, handler: IMapEventHandler): MockMap {
        const existing = this.listeners[event] ?? [];
        this.listeners[event] = [...existing, handler];
        return this;
    }

    public off(event: string, handler: IMapEventHandler): MockMap {
        const existing = this.listeners[event] ?? [];
        this.listeners[event] = existing.filter((item) => item !== handler);
        return this;
    }
}

class MockPopup {
    public constructor(_options: object) {}
}

vi.mock("maplibre-gl", () => ({
    Map: MockMap,
    Popup: MockPopup,
}));

const MAP_STYLE: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [],
};

function createContainer(): HTMLDivElement {
    return document.createElement("div");
}

describe("initializeMapLibreMap", () => {
    beforeEach(() => {
        lastMapOptions = undefined;
        disableRotationMock.mockClear();
    });

    it("uses renderWorldCopies disabled by default", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
        });

        expect(lastMapOptions?.renderWorldCopies).toBe(false);
    });

    it("keeps default maxZoom when not provided", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
        });

        expect(lastMapOptions?.maxZoom).toBe(8);
    });

    it("applies numeric maxZoom override", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
            maxZoom: 5,
        });

        expect(lastMapOptions?.maxZoom).toBe(5);
    });

    it("removes maxZoom when maxZoom is null", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
            maxZoom: null,
        });

        expect(Object.prototype.hasOwnProperty.call(lastMapOptions ?? {}, "maxZoom")).toBe(false);
    });

    it("keeps pan/zoom navigation defaults when no navigation override is provided", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
        });

        expect(lastMapOptions?.dragPan).toBeUndefined();
        expect(lastMapOptions?.scrollZoom).toBeUndefined();
        expect(lastMapOptions?.doubleClickZoom).toBeUndefined();
        expect(lastMapOptions?.boxZoom).toBeUndefined();
        expect(lastMapOptions?.keyboard).toBeUndefined();
    });

    it("disables pan/zoom interactions when viewport navigation disables both", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
            navigation: {
                pan: false,
                zoom: false,
            },
        });

        expect(lastMapOptions?.dragPan).toBe(false);
        expect(lastMapOptions?.scrollZoom).toBe(false);
        expect(lastMapOptions?.doubleClickZoom).toBe(false);
        expect(lastMapOptions?.boxZoom).toBe(false);
        expect(lastMapOptions?.touchZoomRotate).toBe(false);
        expect(lastMapOptions?.keyboard).toBe(false);
    });

    it("disables touch rotation when zoom navigation is enabled and touch zoom is enabled", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
            touchZoomRotate: true,
            navigation: {
                zoom: true,
            },
        });

        expect(disableRotationMock).toHaveBeenCalledTimes(1);
    });

    it("keeps non-wrapped wide bounds unchanged during initialization", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
            bounds: {
                southWest: { lng: -170, lat: -20 },
                northEast: { lng: 170, lat: 20 },
            },
        });

        expect(lastMapOptions?.bounds).toEqual([
            [-170, -20],
            [170, 20],
        ]);
    });

    it("normalizes explicit wrapped bounds where east is lower than west", async () => {
        await initializeMapLibreMap({
            container: createContainer(),
            style: MAP_STYLE,
            tileset: "default",
            bounds: {
                southWest: { lng: 170, lat: -15 },
                northEast: { lng: -170, lat: 25 },
            },
        });

        expect(lastMapOptions?.bounds).toEqual([
            [170, -15],
            [190, 25],
        ]);
    });
});
