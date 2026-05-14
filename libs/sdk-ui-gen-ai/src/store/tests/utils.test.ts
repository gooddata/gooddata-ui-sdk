// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getConversationLocalId, isConversationWithLocalId } from "../utils.js";

describe("store utils", () => {
    describe("isConversationWithId", () => {
        it("should return true when conversation has matching id", () => {
            expect(
                isConversationWithLocalId(
                    {
                        id: "conversation-1",
                        title: "Conversation",
                        localId: "conversation-1",
                        createdAt: new Date(1).toISOString(),
                        updatedAt: new Date(1).toISOString(),
                    },
                    "conversation-1",
                ),
            ).toBe(true);
        });

        it("should return false for undefined conversation", () => {
            expect(isConversationWithLocalId(undefined, "conversation-1")).toBe(false);
        });
    });

    describe("getConversationId", () => {
        it("should return conversation id for regular conversation", () => {
            expect(
                getConversationLocalId({
                    id: "conversation-2",
                    title: "Conversation",
                    localId: "conversation-2",
                    createdAt: new Date(1).toISOString(),
                    updatedAt: new Date(1).toISOString(),
                }),
            ).toBe("conversation-2");
        });

        it("should return undefined for undefined value", () => {
            expect(getConversationLocalId(undefined)).toBeUndefined();
        });
    });
});
