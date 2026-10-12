// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createMapLibreWorkerUrlEnsurer,
    getBundledMapLibreWorkerUrl,
    resolveMapLibreWorkerUrl,
} from "./mapWorker.js";

const { WORKER_SOURCE } = vi.hoisted(() => ({ WORKER_SOURCE: "self.onmessage = () => {};" }));

vi.mock("../../../../worker/maplibre-gl-worker.source.js", () => ({ default: WORKER_SOURCE }));

const BLOB_URL = "blob:test";

function sameOriginAssetUrl(): string {
    return `${location.origin}/static/maplibre-gl-worker.js`;
}

describe("mapWorker", () => {
    let blobs: Blob[];
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        blobs = [];
        vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
            blobs.push(blob as Blob);
            return BLOB_URL;
        });
        fetchMock = vi
            .fn()
            .mockResolvedValue({ ok: true, headers: new Headers({ "content-type": "text/javascript" }) });
        vi.stubGlobal("fetch", fetchMock);
    });

    describe("getBundledMapLibreWorkerUrl", () => {
        it("resolves the bundled worker in the package worker folder", () => {
            // four levels above src/next/map/runtime/ is the package root
            expect(getBundledMapLibreWorkerUrl()).toMatch(/\/worker\/maplibre-gl-worker\.js$/);
            expect(getBundledMapLibreWorkerUrl()).not.toMatch(/\/(src|esm|next|map|runtime)\/worker\//);
        });
    });

    describe("resolveMapLibreWorkerUrl", () => {
        it("uses the bundled worker file when it is a same-origin file the server has", async () => {
            const assetUrl = sameOriginAssetUrl();

            await expect(resolveMapLibreWorkerUrl(assetUrl)).resolves.toBe(assetUrl);

            expect(fetchMock).toHaveBeenCalledWith(assetUrl, { method: "HEAD" });
            expect(blobs).toHaveLength(0);
        });

        it("starts the inline worker when the server does not have the bundled file", async () => {
            fetchMock.mockResolvedValue({ ok: false });

            await expect(resolveMapLibreWorkerUrl(sameOriginAssetUrl())).resolves.toBe(BLOB_URL);

            expect(blobs).toHaveLength(1);
            expect(blobs[0]!.type).toBe("text/javascript");
            await expect(blobs[0]!.text()).resolves.toBe(WORKER_SOURCE);
        });

        it("starts the inline worker when the probe fails", async () => {
            fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

            await expect(resolveMapLibreWorkerUrl(sameOriginAssetUrl())).resolves.toBe(BLOB_URL);
        });

        it.each([
            ["a file URL inlined by webpack", "file:///app/node_modules/@gooddata/sdk-ui-geo/worker/w.js"],
            ["a data URL inlined by Vite library mode", "data:text/javascript;base64,AA=="],
            ["a cross-origin URL", "https://cdn.example.com/static/maplibre-gl-worker.js"],
            ["an invalid URL", "not a url"],
        ])("starts the inline worker without a probe for %s", async (_name, assetUrl) => {
            await expect(resolveMapLibreWorkerUrl(assetUrl)).resolves.toBe(BLOB_URL);

            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe("createMapLibreWorkerUrlEnsurer", () => {
        it("keeps a worker URL configured through maplibre-gl", async () => {
            const resolveWorkerUrl = vi.fn().mockResolvedValue(BLOB_URL);
            const setWorkerUrl = vi.fn();
            const ensure = createMapLibreWorkerUrlEnsurer(resolveWorkerUrl);

            await ensure({ getWorkerUrl: () => "https://example.com/worker.js", setWorkerUrl });

            expect(setWorkerUrl).not.toHaveBeenCalled();
            expect(resolveWorkerUrl).not.toHaveBeenCalled();
        });

        it("resolves the bundled worker once and shares it between maps", async () => {
            const resolveWorkerUrl = vi.fn().mockResolvedValue(BLOB_URL);
            const first = vi.fn();
            const second = vi.fn();
            const ensure = createMapLibreWorkerUrlEnsurer(resolveWorkerUrl);

            await Promise.all([
                ensure({ getWorkerUrl: () => "", setWorkerUrl: first }),
                ensure({ getWorkerUrl: () => "", setWorkerUrl: second }),
            ]);

            expect(first).toHaveBeenCalledWith(BLOB_URL);
            expect(second).toHaveBeenCalledWith(BLOB_URL);
            expect(resolveWorkerUrl).toHaveBeenCalledTimes(1);
        });

        it("retries the resolution after a failure", async () => {
            const resolveWorkerUrl = vi
                .fn()
                .mockRejectedValueOnce(new Error("chunk not loaded"))
                .mockResolvedValue(BLOB_URL);
            const setWorkerUrl = vi.fn();
            const ensure = createMapLibreWorkerUrlEnsurer(resolveWorkerUrl);

            await expect(ensure({ getWorkerUrl: () => "", setWorkerUrl })).rejects.toThrow(
                "chunk not loaded",
            );
            await ensure({ getWorkerUrl: () => "", setWorkerUrl });

            expect(setWorkerUrl).toHaveBeenCalledTimes(1);
            expect(setWorkerUrl).toHaveBeenCalledWith(BLOB_URL);
        });
    });
});
