// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { TigerGeoService } from "./index.js";

const GD_TILE = "https://org.cloud.gooddata.com/api/v1/location/tiles/1/2/3?tileset=vector";

describe("TigerGeoService.getAsset", () => {
    const get = vi.fn();
    const authCall = vi.fn((callback) => callback({ axios: { get }, basePath: "" }));
    const service = new TigerGeoService(authCall as unknown as TigerAuthenticatedCallGuard);

    beforeEach(() => {
        vi.clearAllMocks();
        get.mockResolvedValue({
            data: new ArrayBuffer(4),
            headers: { "cache-control": "max-age=60", expires: "Thu, 01 Jan 2026 00:00:00 GMT" },
        });
    });

    it("loads only the asset path from the client's own backend, never the URL's origin", async () => {
        await service.getAsset(GD_TILE);

        expect(get).toHaveBeenCalledWith(
            "/api/v1/location/tiles/1/2/3?tileset=vector",
            expect.objectContaining({ responseType: "arraybuffer", cache: false }),
        );
    });

    it("re-targets a look-alike URL on a foreign host to the client's own backend", async () => {
        await service.getAsset("https://evil.example.com/api/v1/location/tiles/1/2/3");

        expect(get.mock.calls[0][0]).toBe("/api/v1/location/tiles/1/2/3");
    });

    it("refuses a URL that is not a geo asset before any request is made", async () => {
        await expect(service.getAsset("https://tiles.example.com/1/2/3.png")).rejects.toThrow(
            /Not a geo asset URL/,
        );

        expect(authCall).not.toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });

    it("passes response type and abort signal through and surfaces the cache headers", async () => {
        const abortController = new AbortController();

        const asset = await service.getAsset(GD_TILE, {
            responseType: "json",
            signal: abortController.signal,
        });

        expect(get.mock.calls[0][1]).toMatchObject({ responseType: "json", signal: abortController.signal });
        expect(asset.cacheControl).toBe("max-age=60");
        expect(asset.expires).toBe("Thu, 01 Jan 2026 00:00:00 GMT");
    });
});
