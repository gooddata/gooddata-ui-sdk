// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { debugLog } from "../debug.js";
import { AppNotFoundError, resolveRedirectTarget } from "../loader/redirectLogic.js";
import { getBackend } from "../platformContext/backend.js";

export type RedirectTargetState =
    | { state: "loading" }
    | { state: "render" }
    | { state: "redirect"; url: string }
    | { state: "not-found" }
    | { state: "error"; error: string };

/**
 * Resolves the redirect target for the current URL and permission context.
 */
export function useRedirectTarget(
    apps: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    pathname: string,
): RedirectTargetState {
    const [redirectState, setRedirectState] = useState<RedirectTargetState>({ state: "loading" });

    useEffect(() => {
        let cancelled = false;
        // Preserve "render" state during re-resolution so that HostUiContainer stays mounted
        // while the async redirect check runs. Other states (loading, error, not-found) reset to loading.
        setRedirectState((prev) => (prev.state === "render" ? prev : { state: "loading" }));
        debugLog(`[host-app/redirect] useRedirectTarget: starting resolution for pathname → ${pathname}`);

        const fetchFirstWorkspaceId = (): Promise<string | undefined> =>
            getBackend()
                .workspaces()
                .forCurrentUser()
                .withLimit(1)
                .queryDescriptors()
                .then((result) => result.items[0]?.id);

        resolveRedirectTarget({
            apps,
            ctx: ctx,
            pathname,
            fetchFirstWorkspaceId,
        })
            .then((url) => {
                if (cancelled) {
                    debugLog(
                        `[host-app/redirect] useRedirectTarget: resolution cancelled (stale effect) for pathname → ${pathname}`,
                    );
                    return;
                }
                if (url === null) {
                    debugLog("[host-app/redirect] useRedirectTarget: current URL is valid → render");
                    setRedirectState({ state: "render" });
                } else {
                    debugLog(`[host-app/redirect] useRedirectTarget: redirect needed → ${url}`);
                    setRedirectState({ state: "redirect", url });
                }
            })
            .catch((e: unknown) => {
                if (cancelled) {
                    return;
                }
                if (e instanceof AppNotFoundError) {
                    debugLog(`[host-app/redirect] useRedirectTarget: AppNotFoundError → ${e.message}`);
                    setRedirectState({ state: "not-found" });
                } else {
                    const error = e instanceof Error ? e.message : "Unknown redirect error.";
                    debugLog(`[host-app/redirect] useRedirectTarget: unexpected error → ${error}`);
                    setRedirectState({ state: "error", error });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [apps, pathname, ctx]);

    return redirectState;
}
