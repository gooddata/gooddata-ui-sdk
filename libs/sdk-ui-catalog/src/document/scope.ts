// (C) 2026 GoodData Corporation

import type { IUser, IWorkspacePermissions, ObjectOrigin } from "@gooddata/sdk-model";

import { usePermissionsState } from "../permission/PermissionsContext.js";

/**
 * Whose documents the user sees, as Reports shows them: a user who may not create documents sees only
 * their own native ones. Undefined means all documents.
 */
export function getDocumentOwner(
    user: IUser | undefined,
    permissions: IWorkspacePermissions | undefined,
): string | undefined {
    if (!user || !permissions || permissions.canCreateDocument) {
        return undefined;
    }
    return user.login;
}

export function useDocumentOwner(): string | undefined {
    const { result } = usePermissionsState();
    return getDocumentOwner(result?.user, result?.permissions);
}

export interface IDocumentFilter {
    origin: ObjectOrigin;
    createdBy?: string[];
    excludeCreatedBy?: string[];
}

/**
 * The origin and creator filters narrowed to the owner's native documents, or undefined when they leave
 * none of them to match.
 */
export function scopeDocumentFilter(
    filter: IDocumentFilter,
    owner: string | undefined,
): IDocumentFilter | undefined {
    if (owner === undefined) {
        return filter;
    }
    const { origin, createdBy, excludeCreatedBy } = filter;
    if (origin === "PARENTS") {
        return undefined;
    }
    if (createdBy?.length && !createdBy.includes(owner)) {
        return undefined;
    }
    if (excludeCreatedBy?.includes(owner)) {
        return undefined;
    }
    return { origin: "NATIVE", createdBy: [owner] };
}
