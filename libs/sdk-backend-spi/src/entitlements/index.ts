// (C) 2021-2023 GoodData Corporation
import { IEntitlementDescriptor } from "@gooddata/sdk-model";
/**
 * Provides functions to obtain entitlements
 *
 * @public
 */
export interface IEntitlements {
    /**
     * Returns current license entitlements
     */
    resolveEntitlements(): Promise<IEntitlementDescriptor[]>;
}
