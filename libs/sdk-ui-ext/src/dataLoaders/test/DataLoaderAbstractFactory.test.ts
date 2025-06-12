// (C) 2020-2021 GoodData Corporation
import { dataLoaderAbstractFactory } from "../DataLoaderAbstractFactory.js";
import { describe, it, expect } from "vitest";

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
