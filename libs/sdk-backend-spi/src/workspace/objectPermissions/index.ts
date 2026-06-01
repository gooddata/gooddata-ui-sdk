// (C) 2026 GoodData Corporation

import {
    type IAvailableAccessGrantee,
    type IGranularAccessGrantee,
    type IObjectAccessList,
    type ObjRef,
    type ObjectPermissionsObjectKind,
} from "@gooddata/sdk-model";

/**
 * Identifies an object whose access is being managed. The `kind` lets the backend
 * route to the right endpoint without an extra lookup to resolve the ref.
 *
 * @alpha
 */
export interface IObjectPermissionsObject {
    readonly kind: ObjectPermissionsObjectKind;
    readonly ref: ObjRef;
}

/**
 * Reads and updates who has access to a single catalog object. The grantee
 * types are shared with the dashboard share service so the same UI primitives
 * work for both flows.
 *
 * @alpha
 */
export interface IWorkspaceObjectPermissionsService {
    /**
     * Returns the current list of grants for the given object.
     *
     * @param target - the object whose access to read
     */
    getAccessList(target: IObjectPermissionsObject): Promise<IObjectAccessList>;

    /**
     * Applies the given grants. Grantees not included in `grantees` are left
     * unchanged; a grantee with an empty `permissions` array is removed.
     *
     * @param target - the object whose access to change
     * @param grantees - grants to apply
     */
    manageObjectPermissions(
        target: IObjectPermissionsObject,
        grantees: IGranularAccessGrantee[],
    ): Promise<void>;

    /**
     * Returns the users and groups in the workspace that can be granted access.
     * Excludes the current user. Whether organization admins are excluded
     * depends on the backend.
     *
     * @param target - the object to find available assignees for
     */
    getAvailableAssignees(target: IObjectPermissionsObject): Promise<IAvailableAccessGrantee[]>;
}
