// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAutomationRecipient } from "@gooddata/sdk-model";

import { getRecipientName } from "../utils.js";

describe("automations utils", () => {
    describe("getRecipientName", () => {
        it("should prefer trimmed recipient name", () => {
            const recipient = {
                type: "user",
                id: "u1",
                name: "  John Doe  ",
                email: "john@example.com",
            } satisfies IAutomationRecipient;

            expect(getRecipientName(recipient)).toBe("John Doe");
        });

        it("should fall back to email when name is missing", () => {
            const recipient = {
                type: "user",
                id: "u1",
                email: "  john@example.com  ",
            } satisfies IAutomationRecipient;

            expect(getRecipientName(recipient)).toBe("john@example.com");
        });

        it("should fall back to trimmed email when name is missing/blank", () => {
            const recipient = {
                type: "user",
                id: "u1",
                name: "   ",
                email: "  john@example.com  ",
            } satisfies IAutomationRecipient;

            expect(getRecipientName(recipient)).toBe("john@example.com");
        });

        it("should fall back to id when name and email are missing", () => {
            const recipient = {
                type: "user",
                id: "u1",
            } satisfies IAutomationRecipient;

            expect(getRecipientName(recipient)).toBe("u1");
        });

        it("should fall back to id when name and email are missing/blank", () => {
            const recipient = {
                type: "user",
                id: "u1",
                name: "",
                email: " ",
            } satisfies IAutomationRecipient;

            expect(getRecipientName(recipient)).toBe("u1");
        });

        it("should fall back to id for user groups when name is missing/blank", () => {
            const recipient = {
                type: "userGroup",
                id: "g1",
                name: " ",
            } satisfies IAutomationRecipient;

            expect(getRecipientName(recipient)).toBe("g1");
        });
    });
});
