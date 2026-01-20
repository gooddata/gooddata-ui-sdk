// (C) 2021-2026 GoodData Corporation

import { type ResolvedEntitlements } from "../../types/commonTypes.js";

/**
 * @beta
 */
export interface IEntitlementsState {
    entitlements?: ResolvedEntitlements;
}

export const entitlementsInitialState: IEntitlementsState = { entitlements: undefined };
