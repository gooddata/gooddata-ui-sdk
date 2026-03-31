// (C) 2025-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import type { StyleSpecification } from "../../../layers/common/mapFacade.js";
import { fetchMapStyle } from "../styleEndpoint.js";

const SAMPLE_STYLE: StyleSpecification = {
    version: 8,
    sources: {
        aws: {
            type: "vector",
            tiles: ["https://example.com/tiles/{z}/{x}/{y}"],
        },
    },
    layers: [],
    glyphs: "https://example.com/glyphs/{fontstack}/{range}",
};

const SAMPLE_STYLE_WITH_URL: StyleSpecification = {
    version: 8,
    sources: {
        aws: {
            type: "vector",
            url: "https://example.com/tilejson.json",
        },
    },
    layers: [],
    glyphs: "https://example.com/glyphs/{fontstack}/{range}",
};

const NONE_STYLE: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [{ id: "background", type: "background", paint: { "background-color": "#ffffff" } }],
    glyphs: "https://example.com/glyphs/{fontstack}/{range}",
};

function createVectorLayer(source: string) {
    return {
        id: `${source}-vector-layer`,
        type: "fill" as const,
        source,
        "source-layer": "demo",
        paint: {},
    };
}

function createGeoJsonLayer(source: string) {
    return {
        id: `${source}-geojson-layer`,
        type: "fill" as const,
        source,
        paint: {},
    };
}

function createRasterLayer(source: string) {
    return {
        id: `${source}-raster-layer`,
        type: "raster" as const,
        source,
    };
}

describe("fetchMapStyle", () => {
    it("loads style through backend geo service using getStyleById", async () => {
        const getStyleById = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        const style = await fetchMapStyle(backend, "standard");

        expect(style).toEqual(SAMPLE_STYLE);
        expect(getStyleById).toHaveBeenCalledWith("standard", {
            language: undefined,
        });
        expect(getDefaultStyle).not.toHaveBeenCalled();
    });

    it("uses getDefaultStyle when basemap is undefined", async () => {
        const getStyleById = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await fetchMapStyle(backend);

        expect(getDefaultStyle).toHaveBeenCalledWith({
            language: undefined,
        });
        expect(getStyleById).not.toHaveBeenCalled();
    });

    it("passes satellite basemap param to backend", async () => {
        const getStyleById = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await fetchMapStyle(backend, "satellite");

        expect(getStyleById).toHaveBeenCalledWith("satellite", {
            language: undefined,
        });
        expect(getDefaultStyle).not.toHaveBeenCalled();
    });

    it("accepts none basemap style with empty sources", async () => {
        const getStyleById = vi.fn().mockResolvedValue(NONE_STYLE);
        const getDefaultStyle = vi.fn().mockResolvedValue(NONE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        const style = await fetchMapStyle(backend, "none");

        expect(style).toEqual(NONE_STYLE);
        expect(getStyleById).toHaveBeenCalledWith("none", {
            language: undefined,
        });
    });

    it("passes language param to backend with basemap", async () => {
        const getStyleById = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await fetchMapStyle(backend, "standard", "de");

        expect(getStyleById).toHaveBeenCalledWith("standard", {
            language: "de",
        });
    });

    it("falls back to the default style when the requested style id is not found", async () => {
        const getStyleById = vi
            .fn()
            .mockRejectedValue(new UnexpectedResponseError("Not Found", 404, undefined));
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        const style = await fetchMapStyle(backend, "missing-style");

        expect(style).toEqual(SAMPLE_STYLE);
        expect(getStyleById).toHaveBeenCalledWith("missing-style", {
            language: undefined,
        });
        expect(getDefaultStyle).toHaveBeenCalledWith({
            language: undefined,
        });
    });

    it("rethrows non-404 SPI response errors from getStyleById", async () => {
        const error = new UnexpectedResponseError("Forbidden", 403, undefined);
        const getStyleById = vi.fn().mockRejectedValue(error);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await expect(fetchMapStyle(backend, "standard")).rejects.toBe(error);
        expect(getDefaultStyle).not.toHaveBeenCalled();
    });

    it("rethrows unexpected getStyleById failures", async () => {
        const error = new Error("network failed");
        const getStyleById = vi.fn().mockRejectedValue(error);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await expect(fetchMapStyle(backend, "standard")).rejects.toBe(error);
        expect(getDefaultStyle).not.toHaveBeenCalled();
    });

    it("passes language param to backend without basemap", async () => {
        const getStyleById = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await fetchMapStyle(backend, undefined, "de");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            language: "de",
        });
        expect(getStyleById).not.toHaveBeenCalled();
    });

    it("throws when style is missing version", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, version: undefined };
        const getStyleById = vi.fn().mockResolvedValue(invalidStyle);
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("valid style version");
    });

    it("throws when style has no sources", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, sources: undefined };
        const getStyleById = vi.fn().mockResolvedValue(invalidStyle);
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("must contain sources");
    });

    it("throws when glyphs URL is not absolute", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, glyphs: "/relative/path" };
        const getStyleById = vi.fn().mockResolvedValue(invalidStyle);
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("must be an absolute URL");
    });

    it("accepts vector source with url instead of tiles", async () => {
        const getStyleById = vi.fn().mockResolvedValue(SAMPLE_STYLE_WITH_URL);
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE_WITH_URL);
        const backend = createBackendMock(getDefaultStyle, getStyleById);

        const style = await fetchMapStyle(backend, "standard");

        expect(style).toEqual(SAMPLE_STYLE_WITH_URL);
    });

    it("ignores unused vector source without tiles or url", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            sources: {
                ...SAMPLE_STYLE.sources,
                maptiler_attribution: {
                    type: "vector",
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("accepts referenced geojson source with data", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createGeoJsonLayer("maptiler_attribution")],
            sources: {
                ...SAMPLE_STYLE.sources,
                maptiler_attribution: {
                    type: "geojson",
                    data: { type: "FeatureCollection", features: [] },
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("warns when referenced geojson source is missing data", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createGeoJsonLayer("broken")],
            sources: {
                broken: { type: "geojson" },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing required "data"'));
        warnSpy.mockRestore();
    });

    it("accepts referenced raster source with tiles", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("satellite")],
            sources: {
                satellite: {
                    type: "raster",
                    tiles: ["https://example.com/raster/{z}/{x}/{y}.png"],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("warns when referenced raster source has neither tiles nor url", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("satellite")],
            sources: {
                satellite: { type: "raster" },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("satellite"));
        warnSpy.mockRestore();
    });

    it("accepts terrain-referenced raster-dem source with url", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            terrain: {
                source: "terrain",
            },
            sources: {
                terrain: {
                    type: "raster-dem",
                    url: "https://example.com/terrain-rgb/tiles.json",
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("accepts referenced image source with url and coordinates", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("overlay")],
            sources: {
                overlay: {
                    type: "image",
                    url: "https://example.com/image.png",
                    coordinates: [
                        [-80, 40],
                        [-70, 40],
                        [-70, 30],
                        [-80, 30],
                    ],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("warns when referenced image source is missing url", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("overlay")],
            sources: {
                overlay: {
                    type: "image",
                    coordinates: [
                        [-80, 40],
                        [-70, 40],
                        [-70, 30],
                        [-80, 30],
                    ],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing required "url"'));
        warnSpy.mockRestore();
    });

    it("warns when referenced image source is missing coordinates", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("overlay")],
            sources: {
                overlay: {
                    type: "image",
                    url: "https://example.com/image.png",
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing required "coordinates"'));
        warnSpy.mockRestore();
    });

    it("accepts referenced video source with urls and coordinates", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("vid")],
            sources: {
                vid: {
                    type: "video",
                    urls: ["https://example.com/video.mp4"],
                    coordinates: [
                        [-80, 40],
                        [-70, 40],
                        [-70, 30],
                        [-80, 30],
                    ],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("warns when referenced video source is missing urls", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("vid")],
            sources: {
                vid: {
                    type: "video",
                    coordinates: [
                        [-80, 40],
                        [-70, 40],
                        [-70, 30],
                        [-80, 30],
                    ],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing required "urls"'));
        warnSpy.mockRestore();
    });

    it("accepts referenced canvas source with canvas and coordinates", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createRasterLayer("overlayCanvas")],
            sources: {
                ...SAMPLE_STYLE.sources,
                overlayCanvas: {
                    type: "canvas",
                    canvas: "map-canvas",
                    coordinates: [
                        [-80, 40],
                        [-70, 40],
                        [-70, 30],
                        [-80, 30],
                    ],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("warns on unrecognized referenced source type", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createGeoJsonLayer("mystery")],
            sources: {
                ...SAMPLE_STYLE.sources,
                mystery: { type: "mystery-type" },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("unrecognized type"));
        warnSpy.mockRestore();
    });

    it("accepts maptiler-like style with mixed source types", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createVectorLayer("maptiler_planet")],
            terrain: {
                source: "hillshade",
            },
            sources: {
                maptiler_planet: {
                    type: "vector",
                    url: "https://api.maptiler.com/tiles/v3/tiles.json",
                },
                maptiler_attribution: {
                    type: "vector",
                },
                hillshade: {
                    type: "raster-dem",
                    url: "https://api.maptiler.com/tiles/terrain-rgb/tiles.json",
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it("warns when referenced vector source url is not absolute", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createVectorLayer("test")],
            sources: {
                test: {
                    type: "vector",
                    url: "/relative/tilejson.json",
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("should be an absolute URL"));
        warnSpy.mockRestore();
    });

    it("warns when referenced vector source tiles URL is not absolute", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createVectorLayer("test")],
            sources: {
                test: {
                    type: "vector",
                    tiles: ["/relative/tiles/{z}/{x}/{y}"],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("should be an absolute URL"));
        warnSpy.mockRestore();
    });

    it("warns when a referenced source is missing from the style definition", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const style = {
            ...SAMPLE_STYLE,
            layers: [createVectorLayer("missing-source")],
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(style);
        const backend = createBackendMock(getDefaultStyle);

        const result = await fetchMapStyle(backend, "standard");

        expect(result).toEqual(style);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("missing-source"));
        warnSpy.mockRestore();
    });
});

function createBackendMock(
    getDefaultStyle: ReturnType<typeof vi.fn>,
    getStyleById: ReturnType<typeof vi.fn> = getDefaultStyle,
): IAnalyticalBackend {
    return {
        geo: () => ({
            getDefaultStyle,
            getStyleById,
        }),
    } as unknown as IAnalyticalBackend;
}
