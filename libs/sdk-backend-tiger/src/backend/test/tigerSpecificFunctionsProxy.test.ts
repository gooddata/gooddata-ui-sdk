// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { createTigerSpecificFunctionsProxy } from "../tigerSpecificFunctionsProxy.js";

describe("createTigerSpecificFunctionsProxy", () => {
    it("delegates to the initial implementation", async () => {
        const { functions } = createTigerSpecificFunctionsProxy({
            isCommunityEdition: async () => true,
        });

        await expect(functions.isCommunityEdition!()).resolves.toBe(true);
    });

    it("returns undefined and warns when method is missing", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        const { functions } = createTigerSpecificFunctionsProxy();
        const result = functions.isCommunityEdition!();

        expect(result).toBeUndefined();
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("isCommunityEdition"));

        warnSpy.mockRestore();
    });

    it("swaps the backing implementation via updateImplementation", async () => {
        const { functions, updateImplementation } = createTigerSpecificFunctionsProxy({
            getDeploymentVersion: async () => "v1",
        });

        await expect(functions.getDeploymentVersion!()).resolves.toBe("v1");

        updateImplementation({
            getDeploymentVersion: async () => "v2",
        });

        await expect(functions.getDeploymentVersion!()).resolves.toBe("v2");
    });

    it("passes arguments through to the underlying function", async () => {
        const deleteApiToken = vi.fn().mockResolvedValue(undefined);
        const { functions } = createTigerSpecificFunctionsProxy({ deleteApiToken });

        await functions.deleteApiToken!("user-42", "token-7");

        expect(deleteApiToken).toHaveBeenCalledWith("user-42", "token-7");
    });

    it("returns undefined for symbol property access", () => {
        const { functions } = createTigerSpecificFunctionsProxy({
            isCommunityEdition: async () => true,
        });

        // Symbol access should return undefined, not a function stub
        const symbolValue = (functions as Record<symbol, unknown>)[Symbol.iterator];
        expect(symbolValue).toBeUndefined();
    });

    it("reflects current implementation keys via Object.keys()", () => {
        const { functions, updateImplementation } = createTigerSpecificFunctionsProxy({
            isCommunityEdition: async () => true,
            getDeploymentVersion: async () => "v1",
        });

        expect(Object.keys(functions)).toEqual(
            expect.arrayContaining(["isCommunityEdition", "getDeploymentVersion"]),
        );
        expect(Object.keys(functions)).toHaveLength(2);

        updateImplementation({
            deleteWorkspace: async () => {},
        });

        expect(Object.keys(functions)).toEqual(["deleteWorkspace"]);
    });

    it("spread copies stay dynamically bound after updateImplementation", async () => {
        const { functions, updateImplementation } = createTigerSpecificFunctionsProxy({
            isCommunityEdition: async () => true,
        });

        const spread = { ...functions };

        // Spread captures delegating stubs that look up the current impl at
        // call time — not raw references. Verify that swapping the impl after
        // spreading is reflected in the spread copy.
        expect(typeof spread.isCommunityEdition).toBe("function");
        await expect(spread.isCommunityEdition!()).resolves.toBe(true);

        updateImplementation({
            isCommunityEdition: async () => false,
        });

        await expect(spread.isCommunityEdition!()).resolves.toBe(false);
    });

    it("returns stable references for the same property", () => {
        const { functions } = createTigerSpecificFunctionsProxy({
            isCommunityEdition: async () => true,
        });

        const ref1 = functions.isCommunityEdition;
        const ref2 = functions.isCommunityEdition;

        expect(ref1).toBe(ref2);
    });

    it("keeps stable stub references after updateImplementation", async () => {
        const { functions, updateImplementation } = createTigerSpecificFunctionsProxy({
            isCommunityEdition: async () => true,
        });

        const before = functions.isCommunityEdition;

        updateImplementation({
            isCommunityEdition: async () => false,
        });

        const after = functions.isCommunityEdition;

        // Stub reference stays the same (React dep-array stability)
        expect(before).toBe(after);
        // But the stub dynamically delegates to the new impl
        await expect(after!()).resolves.toBe(false);
    });

    it("defaults to empty implementation when no initial value provided", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        const { functions } = createTigerSpecificFunctionsProxy();

        expect(Object.keys(functions)).toHaveLength(0);

        const result = functions.getDeploymentVersion!();
        expect(result).toBeUndefined();
        expect(warnSpy).toHaveBeenCalledOnce();

        warnSpy.mockRestore();
    });
});
