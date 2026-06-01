// (C) 2026 GoodData Corporation

import { type IUser } from "@gooddata/sdk-model";

/**
 * Builds the display name shown for the current user in the host header.
 *
 * Falls back to `firstName + lastName` when `fullName` is missing, and finally
 * to `login` when neither piece of name metadata is available.
 */
export function getUserDisplayName(user: IUser): string {
    if (user.fullName) {
        return user.fullName;
    }
    const parts = [user.firstName, user.lastName].filter((v): v is string => Boolean(v));
    if (parts.length > 0) {
        return parts.join(" ");
    }
    return user.login;
}

/**
 * Returns the supplied pathname with the `/workspace/{id}` segment swapped for the
 * given `newWorkspaceId`.
 *
 * Falls back to a bare `/workspace/{newWorkspaceId}` if the current pathname does
 * not match the host's `/workspace/*` shape (e.g. when the user is currently on
 * an organization-scoped route).
 */
export function swapWorkspaceInPath(pathname: string, newWorkspaceId: string): string {
    const replaced = pathname.replace(/^\/workspace\/[^/]+/, `/workspace/${newWorkspaceId}`);
    return replaced === pathname ? `/workspace/${newWorkspaceId}` : replaced;
}
