// (C) 2026 GoodData Corporation

import { type RefObject } from "react";

import { type IHostNavigationRequest } from "@gooddata/sdk-pluggable-application-model";

import { normalizePath, stripEmbedPrefix } from "../loader/routing.js";

// Pathname is the most the host can compare: it cannot see the module's in-app route.
export function isSameDestination(targetUrl: string, currentPathname: string): boolean {
    const targetPathname = targetUrl.split(/[?#]/)[0] ?? "";
    return (
        normalizePath(stripEmbedPrefix(targetPathname)) === normalizePath(stripEmbedPrefix(currentPathname))
    );
}

export function runGuardedNavigation(options: {
    url: string;
    currentPathname: string;
    guardRef: RefObject<((request: IHostNavigationRequest) => boolean) | undefined>;
    navigate: (url: string) => void;
}): void {
    const { url, currentPathname, guardRef, navigate } = options;
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

    if (!isSameDestination(url, currentPathname) && guard?.({ url, proceed })) {
        return;
    }
    proceed();
}
