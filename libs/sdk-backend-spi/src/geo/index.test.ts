// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getGeoAssetPath, isGeoAssetUrl } from "./index.js";

const GD_HOST = "https://org.cloud.gooddata.com";

describe("getGeoAssetPath", () => {
    it("strips the origin of an absolute GoodData asset URL and keeps path, query and template tokens", () => {
        expect(getGeoAssetPath(`${GD_HOST}/api/v1/location/tiles/{z}/{x}/{y}?tileset=vector`)).toBe(
            "/api/v1/location/tiles/{z}/{x}/{y}?tileset=vector",
        );
        expect(getGeoAssetPath(`${GD_HOST}:8443/api/v1/location/glyphs/{fontstack}/{range}`)).toBe(
            "/api/v1/location/glyphs/{fontstack}/{range}",
        );
    });

    it("accepts a relative and a protocol-relative asset path", () => {
        expect(getGeoAssetPath("/api/v1/location/styles/default/sprite.json")).toBe(
            "/api/v1/location/styles/default/sprite.json",
        );
        expect(getGeoAssetPath("//org.cloud.gooddata.com/api/v1/location/tiles/1/2/3")).toBe(
            "/api/v1/location/tiles/1/2/3",
        );
    });

    it("rejects URLs that only mention the asset path further in", () => {
        expect(
            getGeoAssetPath("https://tiles.example.com/proxy/api/v1/location/tiles/1/2/3"),
        ).toBeUndefined();
        expect(
            getGeoAssetPath("https://tiles.example.com/?next=/api/v1/location/tiles/1/2/3"),
        ).toBeUndefined();
        expect(getGeoAssetPath("https://tiles.example.com/api/v1/locations/1")).toBeUndefined();
    });

    it("rejects third-party URLs", () => {
        expect(getGeoAssetPath("https://tiles.example.com/{z}/{x}/{y}.png")).toBeUndefined();
        expect(getGeoAssetPath("/icons/sprite")).toBeUndefined();
    });
});

describe("isGeoAssetUrl", () => {
    it("holds exactly when getGeoAssetPath yields a path", () => {
        expect(isGeoAssetUrl(`${GD_HOST}/api/v1/location/tiles/1/2/3`)).toBe(true);
        expect(isGeoAssetUrl("https://evil.example.com/api/v1/location/tiles/1/2/3")).toBe(true);
        expect(isGeoAssetUrl("https://evil.example.com/x/api/v1/location/tiles/1/2/3")).toBe(false);
        expect(isGeoAssetUrl("https://tiles.example.com/{z}/{x}/{y}.png")).toBe(false);
    });
});
