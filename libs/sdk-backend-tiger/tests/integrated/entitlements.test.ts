// (C) 2022 GoodData Corporation
import { describe, beforeAll, expect, it } from "vitest";
import { testBackend } from "./backend.js";

const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("tiger entitlements", () => {
    it("should load all entitlements", async () => {
        const result = backend.entitlements();
        const entitlements = await result.resolveEntitlements();

        expect(entitlements).toContainEqual({ name: "UnlimitedWorkspaces" });
        expect(entitlements).toContainEqual({ name: "UnlimitedUsers" });
    });
});
