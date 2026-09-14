// (C) 2026 GoodData Corporation

import { getContext, select } from "redux-saga/effects";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { getLastActiveAt, setLastActiveAt } from "../localStorage.js";

/**
 * How long the assistant may sit unused before the next open counts as a new session.
 * @internal
 */
export const CONVERSATION_SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;

/**
 * Whether the next open should start a fresh conversation instead of resuming the last one.
 * A missing timestamp keeps the previous resume behaviour.
 * @internal
 */
export function isConversationSessionStale(workspaceId: string, now: number = Date.now()): boolean {
    const lastActiveAt = getLastActiveAt(workspaceId);

    return lastActiveAt !== undefined && now - lastActiveAt > CONVERSATION_SESSION_TIMEOUT_MS;
}

/**
 * @internal
 */
export function touchConversationSession(workspaceId: string, now: number = Date.now()): void {
    setLastActiveAt(workspaceId, now);
}

/** Refresh the session timer on assistant interaction (not on open). @internal */
export function* onConversationActivity() {
    const workspace: string = yield getContext("workspace");

    touchConversationSession(workspace);
}

/** Read staleness and refresh the timer on open. Only one open path calls this per opening. @internal */
export function* consumeStaleConversationSession(): Generator<any, boolean, any> {
    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    if (!settings?.enableAiAgenticConversations || !settings?.enableAiAgenticMultiConversations) {
        return false;
    }

    const workspace: string = yield getContext("workspace");
    const stale = isConversationSessionStale(workspace);
    touchConversationSession(workspace);

    return stale;
}
