// (C) 2022 GoodData Corporation
import { IWorkspaceAccessControlService } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";
import {
    ObjRef,
    AccessGranteeDetail,
    IAvailableAccessGrantee,
    GranteeWithGranularPermissions,
} from "@gooddata/sdk-model";

export class TigerWorkspaceAccessControlService implements IWorkspaceAccessControlService {
    // @ts-expect-error TODO: TNT-1185 Remove this line when properties are used
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, private readonly workspace: string) {}

    // TODO: TNT-1185 Implement method
    public async getAccessList(_sharedObject: ObjRef): Promise<AccessGranteeDetail[]> {
        return Promise.resolve([]);
    }

    public async grantAccess(
        sharedObject: ObjRef,
        grantees: GranteeWithGranularPermissions[],
    ): Promise<void> {
        return this.changeAccess(sharedObject, grantees);
    }

    public async revokeAccess(
        sharedObject: ObjRef,
        grantees: GranteeWithGranularPermissions[],
    ): Promise<void> {
        return this.changeAccess(sharedObject, grantees);
    }

    // TODO: TNT-1185 Implement method
    public async changeAccess(
        _sharedObject: ObjRef,
        _grantees: GranteeWithGranularPermissions[],
    ): Promise<void> {
        return Promise.resolve();
    }

    // TODO: TNT-1185 Implement method
    public async getAvailableGrantees(
        _sharedObject: ObjRef,
        _search?: string,
    ): Promise<IAvailableAccessGrantee[]> {
        return Promise.resolve([]);
    }
}
