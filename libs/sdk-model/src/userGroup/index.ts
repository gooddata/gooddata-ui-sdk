// (C) 2019-2022 GoodData Corporation
import { ObjRef } from "../objRef/index.js";

/**
 * User Group
 * @alpha
 */
export interface IWorkspaceUserGroup {
    /**
     * Stored user group reference
     */
    ref: ObjRef;
    /**
     * Stored user group id
     */
    id?: string;
    /**
     * Group name
     */
    name?: string;
    /**
     * Group description
     */
    description?: string;
}
