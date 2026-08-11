// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useRef } from "react";

import {
    isExternalPluggableApplicationRegistryItem,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { preloadPluggableApplication } from "../loader/pluggableApplicationsLoader.js";
import { getApplicationHref } from "../loader/routing.js";

/**
 * How long the pointer has to rest on an application link before its bundle is preloaded.
 *
 * The handler is attached to the header wrapper, so a pointer swept across the navigation
 * passes over every link. Firing immediately would preload every application at once —
 * hundreds of requests for applications the user is not going to open. Waiting for the
 * pointer to settle turns "crossed the link" into "aimed at the link".
 */
export const PRELOAD_HOVER_INTENT_MS = 150;

/**
 * @internal
 */
export interface IAppPreloadOnHoverHandlers {
    onMouseOver: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
}

/**
 * Preloads an application's bundle when the pointer settles on its header link.
 *
 * Each application is scheduled at most once — the preload itself is idempotent, but there is
 * no point re-arming a timer for a bundle already requested.
 *
 * @internal
 */
export function useAppPreloadOnHover(
    resolvedApplications: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    pathname: string,
): IAppPreloadOnHoverHandlers {
    const timeoutRef = useRef<number | undefined>(undefined);
    const scheduledAppIdsRef = useRef(new Set<string>());

    const cancelPendingPreload = useCallback(() => {
        if (timeoutRef.current !== undefined) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    // Do not leave a timer behind that would preload into an unmounted chrome.
    useEffect(() => cancelPendingPreload, [cancelPendingPreload]);

    const onMouseOver = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            // Any movement inside the header invalidates a pending preload: the pointer has
            // left the link it was aimed at, so it never settled there. Cancelling up front
            // covers every way out of this handler — a non-anchor target such as the workspace
            // picker, an anchor belonging to no application, and an external application —
            // whereas the header's own onMouseLeave only fires once the pointer is out of the
            // header entirely. Re-armed below if the pointer landed on an application link.
            cancelPendingPreload();

            const anchor = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
            if (!anchor) {
                return;
            }
            const href = anchor.getAttribute("href");
            if (!href) {
                return;
            }
            for (const app of resolvedApplications) {
                if (isExternalPluggableApplicationRegistryItem(app)) {
                    continue;
                }
                if (getApplicationHref(app, ctx, pathname) !== href) {
                    continue;
                }
                if (scheduledAppIdsRef.current.has(app.id)) {
                    return;
                }
                timeoutRef.current = window.setTimeout(() => {
                    timeoutRef.current = undefined;
                    scheduledAppIdsRef.current.add(app.id);
                    preloadPluggableApplication(app);
                }, PRELOAD_HOVER_INTENT_MS);
                return;
            }
        },
        [resolvedApplications, ctx, pathname, cancelPendingPreload],
    );

    return { onMouseOver, onMouseLeave: cancelPendingPreload };
}
