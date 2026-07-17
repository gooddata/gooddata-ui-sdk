// (C) 2026 GoodData Corporation

import { type IGenAIUserContext, areObjRefsEqual } from "@gooddata/sdk-model";

export function isReferenceChanged(
    oldContext: IGenAIUserContext | undefined,
    newContext: IGenAIUserContext | undefined,
): boolean {
    const oldDashboardRef = oldContext?.view?.dashboard?.ref;
    const newDashboardRef = newContext?.view?.dashboard?.ref;

    return !areObjRefsEqual(oldDashboardRef, newDashboardRef);
}
