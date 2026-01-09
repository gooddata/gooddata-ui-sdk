// (C) 2026 GoodData Corporation

const OPENED_KEY = "gd-gen-ai-is-opened";

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
