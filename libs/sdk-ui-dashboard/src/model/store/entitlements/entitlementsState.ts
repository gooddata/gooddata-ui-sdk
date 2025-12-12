// (C) 2021-2023 GoodData Corporation

import { type ResolvedEntitlements } from "../../types/commonTypes.js";

/**
 * @beta
 */
export interface EntitlementsState {
    entitlements?: ResolvedEntitlements;
}

export const entitlementsInitialState: EntitlementsState = { entitlements: undefined };
