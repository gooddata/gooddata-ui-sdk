// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import type { IChatConversationLocal } from "../model.js";
import { type StoredConversation } from "../types.js";

export function isConversationWithLocalId(
    conv: IChatConversationLocal | undefined,
    localId?: string,
): conv is IChatConversationLocal {
    return Boolean(conv && conv.localId === localId);
}

export function getConversationLocalId(conv: IChatConversationLocal | undefined) {
    return conv?.localId;
}

export function createEmptyConversation(): IChatConversationLocal {
    return {
        id: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "",
        localId: uuid(),
    };
}

export function getConversationData(data: Record<string, StoredConversation>, localId?: string) {
    if (!localId) {
        return undefined;
    }
    if (data[localId]) {
        return data[localId];
    }
    data[localId] = {
        order: [],
        items: {},
    };
    return data[localId];
}
