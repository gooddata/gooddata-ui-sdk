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

describe("fetchMapStyle", () => {
    it("loads style through backend geo service", async () => {
        const getDefaultStyle = vi.fn().mockResolvedValue(SAMPLE_STYLE);
        const backend = createBackendMock(getDefaultStyle);

        const style = await fetchMapStyle(backend, "default");

        expect(style).toEqual(SAMPLE_STYLE);
        expect(getDefaultStyle).toHaveBeenCalledTimes(1);
    });

    it("throws when style is missing version", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, version: undefined };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "default")).rejects.toThrow("valid style version");
    });

    it("throws when style has no sources", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, sources: undefined };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "default")).rejects.toThrow("must contain sources");
    });

    it("throws when glyphs URL is not absolute", async () => {
        const invalidStyle = { ...SAMPLE_STYLE, glyphs: "/relative/path" };
        const getDefaultStyle = vi.fn().mockResolvedValue(invalidStyle);
        const backend = createBackendMock(getDefaultStyle);

        await expect(fetchMapStyle(backend, "default")).rejects.toThrow("must be an absolute URL");
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

        await expect(fetchMapStyle(backend, "default")).rejects.toThrow("must be an absolute URL");
    });
});

function createBackendMock(getDefaultStyle: ReturnType<typeof vi.fn>): IAnalyticalBackend {
    return {
        geo: () => ({
            getDefaultStyle,
        }),
    } as unknown as IAnalyticalBackend;
}
