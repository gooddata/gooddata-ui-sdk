// (C) 2021-2022 GoodData Corporation

import { ObjRef, AccessGranteeDetail, IAccessGrantee } from "@gooddata/sdk-model";

/**
 * Service to manage access to the objects.
 *
 * @alpha
 */
export interface IWorkspaceAccessControlService {
    getAccessList(sharedObject: ObjRef): Promise<AccessGranteeDetail[]>;

    grantAccess(sharedObject: ObjRef, grantees: IAccessGrantee[]): Promise<void>;

    revokeAccess(sharedObject: ObjRef, grantees: IAccessGrantee[]): Promise<void>;
}
