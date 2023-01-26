// (C) 2021-2023 GoodData Corporation

import { ResolvedEntitlements } from "../../types/commonTypes";

/**
 * @alpha
 */
export interface EntitlementsState {
    entitlements?: ResolvedEntitlements;
}

export const entitlementsInitialState: EntitlementsState = { entitlements: undefined };
