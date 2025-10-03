// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isFreemiumEdition } from "../featureFlags.js";

describe("featureFlags utils", () => {
    describe("isFreemiumEdition", () => {
        it("should return false if user is not free/growth", () => {
            const isFreemiumCustomer = isFreemiumEdition("enterprise");
            expect(isFreemiumCustomer).toBe(false);
        });

        it("should return true if user is growth", () => {
            const isFreemiumCustomer = isFreemiumEdition("growth");
            expect(isFreemiumCustomer).toBe(true);
        });

        it("should return true if user is free", () => {
            const isFreemiumCustomer = isFreemiumEdition("free");
            expect(isFreemiumCustomer).toBe(true);
        });

        it("should return false if user is not defined", () => {
            const isFreemiumCustomer = isFreemiumEdition(undefined);
            expect(isFreemiumCustomer).toBe(false);
        });
    });
});
