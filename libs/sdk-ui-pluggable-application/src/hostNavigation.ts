// (C) 2026 GoodData Corporation

import { type IHostNavigationRequest } from "@gooddata/sdk-pluggable-application-model";

/**
 * Mutable slot an application's router fills with its navigate function once it exists.
 *
 * @remarks
 * The path handed to `navigate` is relative to the application's base path (starts with "/").
 * The implementation must navigate with history REPLACE semantics: the takeover lets the host
 * push first (see {@link createHostNavigationTakeover}), so the replace lands on the entry that
 * push created and history gains exactly one entry, with the source entry preserved.
 *
 * An application whose navigation guard can cancel this navigation (an unsaved-changes blocker)
 * is responsible for restoring the URL when the user cancels — the host push has already
 * happened by then. gdc-reports' editor does this on its Stay choice.
 *
 * @alpha
 */
export interface IPluggableAppNavigateRef {
    current: ((path: string) => void) | null;
}

const RELATIVE_ORIGIN = "https://pluggable.invalid";

// The real origin when running in a browser, so same-origin absolute targets resolve as in-app;
// outside one the sentinel makes every absolute URL foreign, which is the only safe reading.
function resolutionOrigin(): string {
    return typeof location === "object" && location?.origin ? location.origin : RELATIVE_ORIGIN;
}

/**
 * The in-app route a host navigation target stands for, or undefined when the target leaves
 * the application.
 *
 * @remarks
 * Query and hash ride along with the path.
 *
 * @alpha
 */
export function inAppPath(url: string, basePath: string): string | undefined {
    const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    const origin = resolutionOrigin();
    // URL resolution collapses dot segments ("..", "%2e%2e"), which a raw prefix check would let
    // slip past the base and take over a navigation that actually leaves the application.
    let target: URL;
    try {
        target = new URL(url, origin);
    } catch {
        // A target that does not parse is not in-app; the host decides what to do with it.
        return undefined;
    }
    // A cross-origin target is never in-app, whatever its pathname looks like — a navigation to
    // another origin must stay the host's to perform.
    if (target.origin !== origin) {
        return undefined;
    }
    const { pathname } = target;
    if (pathname !== base && !pathname.startsWith(`${base}/`)) {
        return undefined;
    }
    return `${pathname.slice(base.length) || "/"}${target.search}${target.hash}`;
}

/**
 * Builds an {@link @gooddata/sdk-pluggable-application-model#IPluggableApplicationMountHandle.onHostNavigationRequested}
 * handler that takes over host navigations landing inside the application.
 *
 * @remarks
 * The host chrome navigates through its own router, which the application's router does not
 * observe — an unhandled chrome push targeting the application would change the URL and render
 * nothing. The returned handler drives targets inside the base path through the application's
 * own navigation (which also keeps its navigation guards in force) and leaves anything else to
 * the host.
 *
 * The takeover still calls `proceed` before navigating: the host push keeps the host chrome's
 * own location state (menu highlight, targets derived from the current path) in sync and
 * preserves the source history entry; the application then renders by REPLACING that entry
 * with the same URL, so history gains exactly one entry. Push-first is a deliberate trade-off:
 * ordering the push after the application navigation would either destroy the source entry
 * (replace) or duplicate the target (push), and gating it on the navigation committing loses
 * the push when a navigation guard confirms later. The cost is that a guard cancelling the
 * follow-up navigation leaves the pushed URL behind — which is why the guard owner restores
 * the URL on cancel (see {@link IPluggableAppNavigateRef}).
 *
 * @alpha
 */
export function createHostNavigationTakeover(
    basePath: string,
    navigateRef: IPluggableAppNavigateRef,
): (request: IHostNavigationRequest) => boolean {
    return ({ url, proceed }) => {
        const target = inAppPath(url, basePath);
        const navigate = navigateRef.current;
        if (target === undefined || navigate === null) {
            return false;
        }
        proceed();
        navigate(target);
        return true;
    };
}
