// (C) 2025 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { areaAdapter } from "../../area/adapter.js";
import { pushpinAdapter } from "../../pushpin/adapter.js";
import { clearLayerAdapters, getLayerAdapter, registerLayerAdapter } from "../adapterRegistry.js";

afterEach(() => {
    clearLayerAdapters();
    registerLayerAdapter("pushpin", pushpinAdapter);
    registerLayerAdapter("area", areaAdapter);
});

describe("Geo layer adapters registry", () => {
    it("returns pushpin adapter", () => {
        const adapter = getLayerAdapter("pushpin");
        expect(adapter).toBeDefined();
        expect(adapter.type).toBe("pushpin");
        expect(typeof adapter.buildExecution).toBe("function");
        expect(typeof adapter.prepareLayer).toBe("function");
        expect(typeof adapter.syncToMap).toBe("function");
        expect(typeof adapter.removeFromMap).toBe("function");
    });

    it("returns area adapter", () => {
        const adapter = getLayerAdapter("area");
        expect(adapter).toBeDefined();
        expect(adapter.type).toBe("area");
        expect(typeof adapter.buildExecution).toBe("function");
        expect(typeof adapter.prepareLayer).toBe("function");
        expect(typeof adapter.syncToMap).toBe("function");
        expect(typeof adapter.removeFromMap).toBe("function");
    });

    it("allows overriding adapters via registerLayerAdapter", () => {
        const customAdapter = {
            ...pushpinAdapter,
        };

        registerLayerAdapter("pushpin", customAdapter);
        expect(getLayerAdapter("pushpin")).toBe(customAdapter);
    });

    it("throws when adapters are cleared without re-registering", () => {
        clearLayerAdapters();
        expect(() => getLayerAdapter("pushpin")).toThrow("No adapter registered for layer type: pushpin");
    });
});
