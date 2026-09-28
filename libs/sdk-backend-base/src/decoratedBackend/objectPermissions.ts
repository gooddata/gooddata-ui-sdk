// (C) 2026 GoodData Corporation

import {
    type IObjectPermissionsObject,
    type IWorkspaceObjectPermissionsService,
} from "@gooddata/sdk-backend-spi";
import {
    type IAvailableAccessGrantee,
    type IGranularAccessGrantee,
    type IObjectAccessList,
} from "@gooddata/sdk-model";

/**
 * Base class for object-permissions decorators. Delegates every method of the decorated
 * `IWorkspaceObjectPermissionsService`; subclasses override the methods they customize.
 *
 * @alpha
 */
export abstract class DecoratedWorkspaceObjectPermissionsService implements IWorkspaceObjectPermissionsService {
    protected constructor(protected readonly decorated: IWorkspaceObjectPermissionsService) {}

    public getAccessList(target: IObjectPermissionsObject): Promise<IObjectAccessList> {
        return this.decorated.getAccessList(target);
    }

    public manageObjectPermissions(
        target: IObjectPermissionsObject,
        grantees: IGranularAccessGrantee[],
    ): Promise<void> {
        return this.decorated.manageObjectPermissions(target, grantees);
    }

    public getAvailableAssignees(target?: IObjectPermissionsObject): Promise<IAvailableAccessGrantee[]> {
        return this.decorated.getAvailableAssignees(target);
    }
}
