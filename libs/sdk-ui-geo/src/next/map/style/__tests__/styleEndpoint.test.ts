// (C) 2025-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

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

describe("fetchMapStyle", () => {
    it("loads style through backend geo service", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        const style = await fetchMapStyle(backend, "standard");

        expect(style).toEqual(SAMPLE_STYLE);
        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "standard",
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("sends no basemap param when basemap is undefined", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend);

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: undefined,
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("ignores colorScheme when basemap is omitted", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend, undefined, "dark");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: undefined,
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("passes colorScheme param to backend", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend, "standard", "dark");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "standard",
            colorScheme: "dark",
            language: undefined,
        });
    });

    it("passes satellite basemap param to backend", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend, "satellite");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "satellite",
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("ignores colorScheme for satellite basemap", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend, "satellite", "dark");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "satellite",
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("ignores colorScheme for hybrid basemap", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend, "hybrid", "dark");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "hybrid",
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("accepts none basemap style with empty sources", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(NONE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        const style = await fetchMapStyle(backend, "none");

        expect(style).toEqual(NONE_STYLE);
        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "none",
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("ignores colorScheme for none basemap", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(NONE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend, "none", "light");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "none",
            colorScheme: undefined,
            language: undefined,
        });
    });

    it("passes language param to backend", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        await fetchMapStyle(backend, "standard", "light", "de");

        expect(getDefaultStyle).toHaveBeenCalledWith({
            basemap: "standard",
            colorScheme: "light",
            language: "de",
        });
    });

    it("throws when style is missing version", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, version: undefined };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("valid style version");
    });

    it("throws when style has no sources", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, sources: undefined };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("must contain sources");
    });

    it("throws when glyphs URL is not absolute", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, glyphs: "/relative/path" };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("must be an absolute URL");
    });

    it("accepts vector source with url instead of tiles", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE_WITH_URL);
        const backend = createBackendMock(getDefaultStyle);

        const style = await fetchMapStyle(backend, "standard");

        expect(style).toEqual(SAMPLE_STYLE_WITH_URL);
    });

    it("throws when vector source has neither tiles nor url", async () => {
        const invalidStyle = {
            ...SAMPLE_STYLE,
            sources: {
                test: {
                    type: "vector",
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow(
            'must define vector tiles via "tiles" or "url"',
        );
    });

    it("throws when vector source url is not absolute", async () => {
        const invalidStyle = {
            ...SAMPLE_STYLE,
            sources: {
                test: {
                    type: "vector",
                    url: "/relative/tilejson.json",
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("must be an absolute URL");
    });

    it("throws when vector source tiles URL is not absolute", async () => {
        const invalidStyle = {
            ...SAMPLE_STYLE,
            sources: {
                test: {
                    type: "vector",
                    tiles: ["/relative/tiles/{z}/{x}/{y}"],
                },
            },
        };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "standard")).rejects.toThrow("must be an absolute URL");
    });
});

function createBackendMock(getDefaultStyle: ReturnType<typeof vi.fn>): IAnalyticalBackend {
    return {
        geo: () => ({
            getDefaultStyle,
        }),
    } as unknown as IAnalyticalBackend;
}
