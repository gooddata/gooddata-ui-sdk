// (C) 2022 GoodData Corporation
import { testBackend } from "./backend";

const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("tiger entitlements", () => {
    it("should load all entitlements", async () => {
        const result = await backend.entitlements();
        const entitlements = await result.resolveEntitlements();

        expect(entitlements).toContainEqual({ name: "UnlimitedWorkspaces" });
        expect(entitlements).toContainEqual({ name: "UnlimitedUsers" });
    });
});
