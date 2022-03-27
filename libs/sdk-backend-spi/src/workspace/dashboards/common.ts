// (C) 2019-2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

/**
 * Object unique identity
 * @public
 */
export interface IDashboardObjectIdentity {
    /**
     * Object ref
     */
    readonly ref: ObjRef;

    /**
     * Object uri
     */
    readonly uri: string;

    /**
     * Object identifier
     */
    readonly identifier: string;
}
