// (C) 2020-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { dataLoaderAbstractFactory } from "../DataLoaderAbstractFactory.js";

describe("dataLoaderAbstractFactory result", () => {
    class MockLoader {
        // empty
    }

    it("should return the same instance of loader for the same workspace", () => {
        const factory = dataLoaderAbstractFactory(() => new MockLoader());

        const first = factory.forWorkspace("foo");
        const second = factory.forWorkspace("foo");

        expect(second).toBe(first);
    });

    it("should return different instances of loader for different workspaces", () => {
        const factory = dataLoaderAbstractFactory(() => new MockLoader());

        const first = factory.forWorkspace("foo");
        const second = factory.forWorkspace("bar");

        expect(second).not.toBe(first);
    });

    it("should return different instance of loader for the same workspace if the cache has been cleared", () => {
        const factory = dataLoaderAbstractFactory(() => new MockLoader());

        const first = factory.forWorkspace("foo");

        factory.reset();

        const second = factory.forWorkspace("foo");

        expect(second).not.toBe(first);
    });
});
