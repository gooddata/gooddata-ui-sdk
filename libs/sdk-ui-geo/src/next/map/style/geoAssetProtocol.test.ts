// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type IMapLibreProtocolRegistry, registerGeoAssetProtocol } from "./geoAssetProtocol.js";

const GD_TILES = "https://org.cloud.gooddata.com/api/v1/location/tiles/{z}/{x}/{y}";
const GD_SPRITE_JSON = "https://org.cloud.gooddata.com/api/v1/location/sprite.json";
const THIRD_PARTY_TILES = "https://tiles.example.com/{z}/{x}/{y}.png";

function setup(asset: object = { data: new ArrayBuffer(0) }) {
    const getAsset = vi.fn().mockResolvedValue(asset);
    const backend = {
        geo: () => ({ getAsset }),
    } as unknown as IAnalyticalBackend;
    const registry: IMapLibreProtocolRegistry = {
        addProtocol: vi.fn(),
        removeProtocol: vi.fn(),
    };

    const protocol = registerGeoAssetProtocol(registry, backend);
    const [name, handler] = vi.mocked(registry.addProtocol).mock.calls[0];

    return { getAsset, registry, protocol, name, handler };
}

describe("registerGeoAssetProtocol", () => {
    it("moves GoodData-served asset URLs onto the protocol and keeps template tokens intact", () => {
        const { protocol, name } = setup();

        expect(protocol.transformRequest(GD_TILES)).toEqual({
            url: `${name}://${GD_TILES}`,
        });
    });

    it("leaves third-party URLs alone so they never receive credentials", () => {
        const { protocol } = setup();

        expect(protocol.transformRequest(THIRD_PARTY_TILES)).toBeUndefined();
        // Mentioning the asset path deeper in the URL does not make it a GoodData asset.
        expect(
            protocol.transformRequest("https://tiles.example.com/x/api/v1/location/1/2/3"),
        ).toBeUndefined();
        expect(protocol.transformRequest("https://tiles.example.com/?u=/api/v1/location/1")).toBeUndefined();
    });

    it("loads the original URL through the backend and passes the abort signal", async () => {
        const asset = { data: new ArrayBuffer(8), cacheControl: "max-age=60" };
        const { getAsset, name, handler } = setup(asset);
        const abortController = new AbortController();

        const result = await handler({ url: `${name}://${GD_TILES}`, type: "arrayBuffer" }, abortController);

        expect(getAsset).toHaveBeenCalledWith(GD_TILES, {
            responseType: "arraybuffer",
            signal: abortController.signal,
        });
        expect(result).toBe(asset);
    });

    it("asks for parsed JSON only for json resources, as MapLibre expects", async () => {
        const { getAsset, name, handler } = setup();

        await handler({ url: `${name}://${GD_SPRITE_JSON}`, type: "json" }, new AbortController());
        await handler({ url: `${name}://${GD_TILES}`, type: "image" }, new AbortController());

        expect(getAsset.mock.calls[0][1].responseType).toBe("json");
        expect(getAsset.mock.calls[1][1].responseType).toBe("arraybuffer");
    });

    it("binds every map to a protocol and backend of its own", async () => {
        const first = setup();
        const second = setup();

        await second.handler({ url: `${second.name}://${GD_TILES}` }, new AbortController());

        expect(second.name).not.toBe(first.name);
        expect(first.getAsset).not.toHaveBeenCalled();
        expect(second.getAsset).toHaveBeenCalledTimes(1);
    });

    it("unregisters the protocol on release", () => {
        const { registry, protocol, name } = setup();

        protocol.release();

        expect(registry.removeProtocol).toHaveBeenCalledWith(name);
    });
});
