// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IChatConversationLocal } from "../../../model.js";
import {
    ConversationDateGroup,
    type ConversationDateGroupConfig,
    groupConversationsByDate,
} from "../conversationGrouper.js";

function createConversation(id: string, updatedAt: string): IChatConversationLocal {
    return {
        id,
        createdAt: updatedAt,
        updatedAt,
    };
}

function daysAgoIso(days: number, from: Date): string {
    const date = new Date(from);
    date.setUTCDate(date.getUTCDate() - days);

    return date.toISOString();
}

describe("groupConversationsByDate", () => {
    const now = new Date("2026-05-04T09:24:00.000Z");

    it("should group conversations to default date buckets", () => {
        const conversations: IChatConversationLocal[] = [
            createConversation("today", daysAgoIso(0, now)),
            createConversation("last-7-days", daysAgoIso(3, now)),
            createConversation("older", daysAgoIso(14, now)),
        ];

        expect(groupConversationsByDate(conversations, undefined, now)).toEqual([
            {
                group: ConversationDateGroup.TODAY,
                conversations: [conversations[0]],
            },
            {
                group: ConversationDateGroup.LAST_7_DAYS,
                conversations: [conversations[1]],
            },
            {
                group: ConversationDateGroup.OLDER,
                conversations: [conversations[2]],
            },
        ]);
    });

    it("should use custom configuration and preserve configured order", () => {
        const conversations: IChatConversationLocal[] = [
            createConversation("older", daysAgoIso(5, now)),
            createConversation("newer", daysAgoIso(0, now)),
        ];
        const groups: ConversationDateGroupConfig[] = [
            { group: ConversationDateGroup.OLDER, maxAgeDays: Number.POSITIVE_INFINITY },
            { group: ConversationDateGroup.TODAY, maxAgeDays: 0 },
        ];

        expect(groupConversationsByDate(conversations, groups, now)).toEqual([
            {
                group: ConversationDateGroup.OLDER,
                conversations: [conversations[0]],
            },
            {
                group: ConversationDateGroup.TODAY,
                conversations: [conversations[1]],
            },
        ]);
    });
});
