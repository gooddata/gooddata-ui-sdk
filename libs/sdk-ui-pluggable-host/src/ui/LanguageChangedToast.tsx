// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { useUiToast } from "@gooddata/sdk-ui-kit";

const LANGUAGE_CHANGED_KEY = "gd-user-language-changed";
const MAX_RELOAD_DURATION_MS = 60_000;

/**
 * Remembers the language change for the success toast after the page reloads.
 */
export function rememberLanguageChange() {
    try {
        sessionStorage.setItem(LANGUAGE_CHANGED_KEY, String(Date.now()));
    } catch {
        // sessionStorage unavailable (privacy mode, sandboxed iframe): no success toast
    }
}

/**
 * Shows the success toast once, when the page loads after a language change.
 */
export function LanguageChangedToast() {
    const { addSuccess } = useUiToast();

    useEffect(() => {
        if (takeLanguageChange()) {
            addSuccess({ descriptor: { id: "languageDialog.success" } });
        }
    }, [addSuccess]);

    return null;
}

function takeLanguageChange() {
    try {
        const changedAt = Number(sessionStorage.getItem(LANGUAGE_CHANGED_KEY));
        sessionStorage.removeItem(LANGUAGE_CHANGED_KEY);
        const pageLoadedAt = performance.timeOrigin; // `timeOrigin` is when this page started loading
        return changedAt < pageLoadedAt && pageLoadedAt - changedAt < MAX_RELOAD_DURATION_MS;
    } catch {
        // sessionStorage unavailable (privacy mode, sandboxed iframe): no success toast
        return false;
    }
}
