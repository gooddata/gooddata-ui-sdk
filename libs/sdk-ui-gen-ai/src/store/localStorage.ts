// (C) 2026 GoodData Corporation

import type { Message } from "../model.js";

const OPENED_KEY = "gd-gen-ai-is-opened";
const MESSAGES_KEY_PREFIX = "gd-gen-ai-messages";

export function getIsOpened() {
    if (typeof localStorage !== "undefined") {
        try {
            return localStorage.getItem(OPENED_KEY) === "true";
        } catch (e) {
            console.error("Failed to read gd-ai-assistant status from localStorage.", e);
            return undefined;
        }
    }
    return undefined;
}

export function setIsOpened(isOpened: boolean) {
    if (typeof localStorage !== "undefined") {
        try {
            if (isOpened) {
                localStorage.setItem(OPENED_KEY, "true");
            } else {
                localStorage.removeItem(OPENED_KEY);
            }
        } catch (e) {
            console.error("Failed to write gd-ai-assistant status to localStorage.", e);
        }
    }
}

function getMessagesKey(workspaceId: string): string {
    return `${MESSAGES_KEY_PREFIX}-${workspaceId}`;
}

export function saveMessages(workspaceId: string, messages: Message[]): void {
    if (typeof sessionStorage === "undefined") {
        return;
    }
    try {
        sessionStorage.setItem(getMessagesKey(workspaceId), JSON.stringify(messages));
    } catch {
        // Fail silently (e.g. quota exceeded or serialization errors)
    }
}

export function loadMessages(workspaceId: string): Message[] | undefined {
    if (typeof sessionStorage === "undefined") {
        return undefined;
    }
    try {
        const raw = sessionStorage.getItem(getMessagesKey(workspaceId));
        if (!raw) {
            return undefined;
        }
        return JSON.parse(raw) as Message[];
    } catch {
        return undefined;
    }
}

export function clearCachedMessages(workspaceId: string): void {
    if (typeof sessionStorage === "undefined") {
        return;
    }
    try {
        sessionStorage.removeItem(getMessagesKey(workspaceId));
    } catch {
        // Fail silently
    }
}
