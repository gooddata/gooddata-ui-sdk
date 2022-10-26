// (C) 2019-2022 GoodData Corporation
import { IWorkspacePermissionsService } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertPermissions } from "../../../convertors/toBackend/WorkspaceConverter";
import { userLoginMd5FromAuthenticatedPrincipal } from "../../../utils/api";

const emptyPermissions = { permissions: {} };

export class BearWorkspacePermissionsFactory implements IWorkspacePermissionsService {
    constructor(public readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getPermissionsForCurrentUser(): Promise<IWorkspacePermissions> {
        const permissions = await this.authCall(async (sdk, { getPrincipal }) => {
            let userLoginMd5;
            try {
                userLoginMd5 = await userLoginMd5FromAuthenticatedPrincipal(getPrincipal);
                return sdk.project.getPermissions(this.workspace, userLoginMd5);
            } catch {
                // if getting the userLoginMd5 fails, fall back to null -> empty permissions
                return null;
            }
        });
        return convertPermissions(permissions?.associatedPermissions || emptyPermissions);
    }
}
