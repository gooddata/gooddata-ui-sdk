// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { type NavigateFunction } from "react-router";

import { debugLog } from "../debug.js";

import { type RedirectTargetState } from "./useRedirectTarget.js";

/**
 * Performs a single `replace` navigation when the redirect state transitions to "redirect".
 * Deduplicates consecutive redirects to the same URL by tracking the last navigated path.
 */
export function useRedirectNavigation(redirect: RedirectTargetState, navigate: NavigateFunction): void {
    const lastNavigatedUrl = useRef<string | null>(null);

    useEffect(() => {
        if (redirect.state === "redirect" && redirect.url !== lastNavigatedUrl.current) {
            lastNavigatedUrl.current = redirect.url;
            debugLog(`[host-app/redirect] Root: navigating (replace) → ${redirect.url}`);
            void navigate(redirect.url, { replace: true });
            return;
        }
        if (redirect.state !== "redirect") {
            // Reset when a new resolution cycle begins so that revisiting the same redirect
            // target (e.g. navigating back to a workspace root) isn't silently swallowed.
            lastNavigatedUrl.current = null;
        }
    }, [redirect, navigate]);
}
