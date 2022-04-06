// (C) 2019-2022 GoodData Corporation
import { IWorkspacePermissionsService } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertPermissions } from "../../../convertors/toBackend/WorkspaceConverter";

const emptyPermissions = { permissions: {} };

export class BearWorkspacePermissionsFactory implements IWorkspacePermissionsService {
    constructor(public readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getPermissionsForCurrentUser(): Promise<IWorkspacePermissions> {
        const bootstrapResource = await this.authCall((sdk) =>
            sdk.user.getBootstrapResource({ projectId: this.workspace }),
        );
        return convertPermissions(
            bootstrapResource.bootstrapResource.current?.projectPermissions || emptyPermissions,
        );
    }
}
