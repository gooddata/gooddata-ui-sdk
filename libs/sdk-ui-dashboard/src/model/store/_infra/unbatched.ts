// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { type BatchAction } from "redux-batched-actions";

/**
 * @internal
 */
export function unbatched(action: Action): Action[] {
    return isBatchAction(action) ? action.payload.flatMap(unbatched) : [action];
}

function isBatchAction(action: Action): action is BatchAction {
    return (
        "meta" in action &&
        typeof action.meta === "object" &&
        action.meta !== null &&
        "batch" in action.meta &&
        action.meta.batch === true
    );
}
