// (C) 2019 GoodData Corporation
import { IWorkspacePermissionsFactory, IWorkspaceUserPermissions } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions, WorkspacePermission } from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "./commonTypes";
import { convertPermissions } from "./fromSdkModel/WorkspaceConverter";

export class BearWorkspacePermissionsFactory implements IWorkspacePermissionsFactory {
    constructor(public readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public async forCurrentUser(): Promise<IWorkspaceUserPermissions> {
        const bootstrapResource = await this.authCall(sdk =>
            sdk.user.getBootstrapResource({ projectId: this.workspace }),
        );
        const permissions = convertPermissions(
            bootstrapResource.bootstrapResource.current!.projectPermissions!,
        );
        return new BearWorkspaceUserPermissions(permissions);
    }
}

export class BearWorkspaceUserPermissions implements IWorkspaceUserPermissions {
    constructor(public readonly permissions: IWorkspacePermissions) {}

    public hasPermission(permission: WorkspacePermission): boolean {
        return this.permissions[permission] === true;
    }
}
