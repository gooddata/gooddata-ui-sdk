// (C) 2019-2020 GoodData Corporation
import { IWorkspacePermissionsFactory, IWorkspaceUserPermissions } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions, WorkspacePermission } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types";
import { convertPermissions } from "../../../convertors/fromSdkModel/WorkspaceConverter";

const emptyPermissions = { permissions: {} };

export class BearWorkspacePermissionsFactory implements IWorkspacePermissionsFactory {
    constructor(public readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async forCurrentUser(): Promise<IWorkspaceUserPermissions> {
        const bootstrapResource = await this.authCall(sdk =>
            sdk.user.getBootstrapResource({ projectId: this.workspace }),
        );
        const permissions = convertPermissions(
            bootstrapResource.bootstrapResource.current?.projectPermissions || emptyPermissions,
        );
        return new BearWorkspaceUserPermissions(permissions);
    }
}

export class BearWorkspaceUserPermissions implements IWorkspaceUserPermissions {
    constructor(public readonly permissions: IWorkspacePermissions) {}

    public allPermissions(): IWorkspacePermissions {
        return { ...this.permissions };
    }

    public hasPermission(permission: WorkspacePermission): boolean {
        return this.permissions[permission] === true;
    }
}
