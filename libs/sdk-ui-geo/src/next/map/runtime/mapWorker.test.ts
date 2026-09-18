// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { ensureMapLibreWorkerUrl, getBundledMapLibreWorkerUrl } from "./mapWorker.js";

describe("mapWorker", () => {
    it("resolves the bundled worker in the package worker folder", () => {
        // four levels above src/next/map/runtime/ is the package root
        expect(getBundledMapLibreWorkerUrl()).toMatch(/\/worker\/maplibre-gl-worker\.js$/);
        expect(getBundledMapLibreWorkerUrl()).not.toMatch(/\/(src|esm|next|map|runtime)\/worker\//);
    });

    it("configures the bundled worker when no worker URL is set", () => {
        const setWorkerUrl = vi.fn();

        ensureMapLibreWorkerUrl({ getWorkerUrl: () => "", setWorkerUrl });

        expect(setWorkerUrl).toHaveBeenCalledWith(getBundledMapLibreWorkerUrl());
    });

    it("keeps a worker URL configured by the consumer", () => {
        const setWorkerUrl = vi.fn();

        ensureMapLibreWorkerUrl({ getWorkerUrl: () => "https://example.com/worker.js", setWorkerUrl });

        expect(setWorkerUrl).not.toHaveBeenCalled();
    });
});
