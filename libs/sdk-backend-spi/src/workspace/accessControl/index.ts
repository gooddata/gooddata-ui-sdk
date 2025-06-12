// (C) 2021-2023 GoodData Corporation

import {
    ObjRef,
    AccessGranteeDetail,
    IAccessGrantee,
    IAvailableAccessGrantee,
    IGranularAccessGrantee,
} from "@gooddata/sdk-model";

/**
 * Service to manage access to the objects.
 *
 * @alpha
 */
export interface IWorkspaceAccessControlService {
    getAccessList(sharedObject: ObjRef): Promise<AccessGranteeDetail[]>;

    grantAccess(sharedObject: ObjRef, grantees: IAccessGrantee[]): Promise<void>;

    revokeAccess(sharedObject: ObjRef, grantees: IAccessGrantee[]): Promise<void>;

    /**
     * Function that allows to change access (add, edit, revoke) to an object for multiple grantees.
     * If the grantee permissions array is empty, the access is revoked. Otherwise, it is set to the
     * permissions in the array.
     *
     * If backend does not support granular permissions, the array content is used only to check if
     * access should be granted or revoked.
     *
     * @param sharedObject - the ref of object that will have access changed
     * @param grantees - list of grantees that will have access changed for the shared object
     */
    changeAccess(sharedObject: ObjRef, grantees: IGranularAccessGrantee[]): Promise<void>;

    /**
     * Get list of available grantees for the shared object.
     * @param sharedObject - the ref of object that will have access changed
     * @param search - optional string used to limit the results (matched against name of user group,
     *  or first name, last name, or email of user).
     */
    getAvailableGrantees(sharedObject: ObjRef, search?: string): Promise<IAvailableAccessGrantee[]>;
}
