// (C) 2026 GoodData Corporation

import { UnexpectedResponseError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

/**
 * Outcome of checking whether a workspace can be opened by the current user.
 *
 * `unknown` is deliberately distinct from `forbidden`: the check itself failing (offline,
 * 5xx) says nothing about the workspace, so it must not be treated as "you cannot open it".
 *
 * @internal
 */
export type WorkspaceAccess = "accessible" | "forbidden" | "unknown";

/**
 * Classifies a failed workspace-permissions request.
 *
 * 403 and 404 both mean no access — Tiger answers 404, with the same message as 403, to avoid
 * leaking whether a workspace exists. Everything else is inconclusive.
 *
 * The single owner of this rule: both the platform context (which gates workspace routes on
 * it) and the redirect resolver (which decides whether to keep a remembered workspace) must
 * agree, or the host can gate on "forbidden" while the resolver keeps sending the user back.
 *
 * @internal
 */
export function classifyWorkspaceAccessError(e: unknown): "forbidden" | "unknown" {
    return e instanceof UnexpectedResponseError && (e.httpStatus === 403 || e.httpStatus === 404)
        ? "forbidden"
        : "unknown";
}

/**
 * Resolves whether the given workspace can be opened by the current user, using the very
 * request the platform context gates workspace routes on — so a workspace the host redirects
 * into is one it can actually load.
 *
 * @internal
 */
export function getWorkspaceAccess(
    backend: IAnalyticalBackend,
    workspaceId: string,
): Promise<WorkspaceAccess> {
    return backend
        .workspace(workspaceId)
        .permissions()
        .getPermissionsForCurrentUser()
        .then((): WorkspaceAccess => "accessible", classifyWorkspaceAccessError);
}
