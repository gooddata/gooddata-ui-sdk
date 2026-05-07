// (C) 2026 GoodData Corporation

import { type IChatConversation } from "@gooddata/sdk-backend-spi";

export enum ConversationDateGroup {
    TODAY = "TODAY",
    LAST_7_DAYS = "LAST_7_DAYS",
    OLDER = "OLDER",
}

export type ConversationDateGroupConfig = {
    group: ConversationDateGroup;
    maxAgeDays: number;
};

export type ConversationDateBucket = {
    group: ConversationDateGroup;
    conversations: IChatConversation[];
};

export const DEFAULT_CONVERSATION_DATE_GROUPS: ConversationDateGroupConfig[] = [
    { group: ConversationDateGroup.TODAY, maxAgeDays: 0 },
    { group: ConversationDateGroup.LAST_7_DAYS, maxAgeDays: 6 },
    { group: ConversationDateGroup.OLDER, maxAgeDays: Number.POSITIVE_INFINITY },
];

export function groupConversationsByDate(
    conversations: IChatConversation[] | undefined = [],
    groups: ConversationDateGroupConfig[] = DEFAULT_CONVERSATION_DATE_GROUPS,
    now: Date = new Date(),
): ConversationDateBucket[] {
    const conversationGroups = new Map<ConversationDateGroup, IChatConversation[]>();

    groups.forEach((group) => {
        conversationGroups.set(group.group, []);
    });

    const sorted = conversations
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    sorted.forEach((conversation) => {
        const updatedAt = new Date(conversation.updatedAt);
        const ageInDays = getAgeInDays(updatedAt, now);
        const targetGroup =
            groups
                .filter((group) => ageInDays <= group.maxAgeDays)
                .sort((a, b) => a.maxAgeDays - b.maxAgeDays)[0]?.group ?? groups[groups.length - 1].group;

        conversationGroups.get(targetGroup)?.push(conversation);
    });

    return groups
        .map((group) => ({
            group: group.group,
            conversations: conversationGroups.get(group.group) ?? [],
        }))
        .filter((group) => group.conversations.length > 0);
}

function getAgeInDays(updatedAt: Date, now: Date): number {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfUpdateDay = new Date(updatedAt);
    startOfUpdateDay.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.floor((startOfToday.getTime() - startOfUpdateDay.getTime()) / msPerDay));
}
