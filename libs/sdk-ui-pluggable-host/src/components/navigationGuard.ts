// (C) 2026 GoodData Corporation

import { type RefObject } from "react";

import { type IHostNavigationRequest } from "@gooddata/sdk-pluggable-application-model";

import { withHostBasePath } from "../loader/hostBasePath.js";
import { normalizePath, stripEmbedPrefix } from "../loader/routing.js";

// Pathname is the most the host can compare: it cannot see the module's in-app route.
export function isSameDestination(targetUrl: string, currentPathname: string): boolean {
    const targetPathname = targetUrl.split(/[?#]/)[0] ?? "";
    return (
        normalizePath(stripEmbedPrefix(targetPathname)) === normalizePath(stripEmbedPrefix(currentPathname))
    );
}

export function runGuardedNavigation(options: {
    /** Host route to navigate to. */
    url: string;
    /** Current host route, without the proxy prefix. */
    currentPathname: string;
    /** Proxy prefix; the guard gets the target as a browser URL to match against its base path. */
    basePath: string;
    guardRef: RefObject<((request: IHostNavigationRequest) => boolean) | undefined>;
    navigate: (url: string) => void;
}): void {
    const { url, currentPathname, basePath, guardRef, navigate } = options;
    const guard = guardRef.current;

    let consumed = false;
    const proceed = () => {
        // An application can retain `proceed`: a second call would push a duplicate history entry, and
        // a call surviving into another mount would navigate on its behalf.
        if (consumed || guardRef.current !== guard) {
            return;
        }
        consumed = true;
        navigate(url);
    };

    if (
        !isSameDestination(url, currentPathname) &&
        guard?.({ url: withHostBasePath(url, basePath), proceed })
    ) {
        return;
    }
    proceed();
}
