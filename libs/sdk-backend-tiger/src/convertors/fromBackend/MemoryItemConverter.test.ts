// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IConvertibleMemoryItem, convertMemoryItem } from "./MemoryItemConverter.js";

function makeMemoryItem(overrides: Partial<IConvertibleMemoryItem> = {}): IConvertibleMemoryItem {
    return {
        id: "mem-1",
        type: "memoryItem",
        attributes: {
            title: "My memory",
            description: "Some description",
            strategy: "ALWAYS",
            instruction: "Always remember this",
            isDisabled: false,
            keywords: ["alpha"],
        },
        ...overrides,
    };
}

describe("convertMemoryItem", () => {
    it("sets isLocked=true when the item origin is PARENT (inherited)", () => {
        const item = makeMemoryItem({
            meta: { origin: { originType: "PARENT", originId: "parent-org" } },
        });

        const result = convertMemoryItem(item, []);

        expect(result.isLocked).toBe(true);
    });

    it("sets isLocked=false when the item origin is NATIVE (locally owned)", () => {
        const item = makeMemoryItem({
            meta: { origin: { originType: "NATIVE", originId: "" } },
        });

        const result = convertMemoryItem(item, []);

        expect(result.isLocked).toBe(false);
    });

    it("sets isLocked=false when the item has no origin meta", () => {
        const item = makeMemoryItem({ meta: undefined });

        const result = convertMemoryItem(item, []);

        expect(result.isLocked).toBe(false);
    });
});
