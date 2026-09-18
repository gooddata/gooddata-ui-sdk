// (C) 2026 GoodData Corporation

const OPENED_KEY = "gd-gen-ai-is-opened";
const LAST_ACTIVE_KEY_PREFIX = "gd-gen-ai-last-active";

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

function getLastActiveKey(workspaceId: string): string {
    return `${LAST_ACTIVE_KEY_PREFIX}-${workspaceId}`;
}

export function getLastActiveAt(workspaceId: string): number | undefined {
    try {
        const raw = globalThis.localStorage?.getItem(getLastActiveKey(workspaceId));
        if (!raw) {
            return undefined;
        }
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

export function setLastActiveAt(workspaceId: string, timestamp: number): void {
    try {
        globalThis.localStorage?.setItem(getLastActiveKey(workspaceId), String(timestamp));
    } catch {
        // Fail silently
    }
}
