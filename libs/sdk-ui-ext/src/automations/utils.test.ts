// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationRecipient,
    type ObjectType,
    idRef,
} from "@gooddata/sdk-model";

import { getRecipientName, isAutomationRestricted } from "./utils.js";

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

    describe("isAutomationRestricted", () => {
        const automation = (unavailable?: IAutomationMetadataObject["unavailable"]) =>
            ({ id: "a1", type: "automation", unavailable }) as IAutomationMetadataObject;
        const forbidden = (id: string, type: ObjectType) =>
            ({ ref: idRef(id, type), type, reason: "forbidden" }) as const;

        it("is not restricted when permissions were not checked", () => {
            expect(isAutomationRestricted(automation())).toBe(false);
        });

        it("is not restricted when nothing is restricted", () => {
            expect(isAutomationRestricted(automation([]))).toBe(false);
        });

        it.each<ObjectType>([
            "insight",
            "analyticalDashboard",
            "measure",
            "attribute",
            "displayForm",
            "fact",
            "computedAttribute",
            "attributeHierarchy",
            "userDataFilter",
        ])("locks the automation when a referenced %s is restricted", (type) => {
            const item = automation([forbidden("x", type)]);

            expect(isAutomationRestricted(item)).toBe(true);
        });
    });
});
