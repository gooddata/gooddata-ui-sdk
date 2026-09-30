// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { type ObjRef, objRefToString } from "@gooddata/sdk-model";

import { useDashboardAsyncRender } from "../../../model/react/useDashboardAsyncRender.js";

/**
 * A placeholder has nothing to load, so it reports its render as requested and resolved at once.
 * The dashboard expects one async render per visualization widget, and an export waits for that
 * count; a placeholder that stays silent makes every export wait out the collection timeout.
 */
export function useResolveRestrictedRender(ref: ObjRef, isRestricted: boolean): void {
    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender(objRefToString(ref));

    useEffect(() => {
        if (!isRestricted) {
            return;
        }
        onRequestAsyncRender();
        onResolveAsyncRender();
    }, [isRestricted, onRequestAsyncRender, onResolveAsyncRender]);
}
