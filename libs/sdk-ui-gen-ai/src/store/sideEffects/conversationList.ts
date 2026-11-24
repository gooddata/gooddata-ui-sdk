// (C) 2026 GoodData Corporation

import { call } from "redux-saga/effects";

import { type IChatConversationItemsQueryResult, type IChatConversations } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";

export function* fetchConversationList(api: IChatConversations) {
    const query = api.getConversationItemsQuery().withSize(100).withPage(0);
    const results: IChatConversationItemsQueryResult = yield call([query, query.query]);

    return results.items.map((item) => ({ ...item, localId: item.id }));
}

export function getLatestConversation(
    conversations: readonly IChatConversationLocal[] | undefined,
): IChatConversationLocal | undefined {
    return conversations
        ?.slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}
