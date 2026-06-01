// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import { UnexpectedResponseError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";

type WorkspacePermissionsState =
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ready"; permissions: IWorkspacePermissions }
    | { state: "forbidden" }
    | { state: "error"; error: string };

/**
 * Loads workspace permissions for the current user.
 *
 * @remarks
 * Returns `"idle"` when `backend` or `workspaceId` is absent.
 * Re-fetches whenever `workspaceId` changes.
 *
 * @internal
 */
export function useWorkspacePermissions(
    backend: IAnalyticalBackend | undefined,
    workspaceId: string | undefined,
): WorkspacePermissionsState {
    const [permissionsState, setPermissionsState] = useState<WorkspacePermissionsState>({
        state: "idle",
    });

    useEffect(() => {
        if (!backend || !workspaceId) {
            setPermissionsState((prev) => (prev.state === "idle" ? prev : { state: "idle" }));
            return;
        }

        let cancelled = false;
        setPermissionsState({ state: "loading" });

        backend
            .workspace(workspaceId)
            .permissions()
            .getPermissionsForCurrentUser()
            .then((permissions) => {
                if (!cancelled) {
                    setPermissionsState({ state: "ready", permissions });
                }
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                // 403/404 on the workspace permissions endpoint means no access — Tiger uses
                // 404 to avoid leaking workspace existence (same message as 403). Signal
                // "forbidden" so the platform context reaches "ready" with undefined permissions
                // and the mounted app can render its own access-denied UI.
                if (e instanceof UnexpectedResponseError && (e.httpStatus === 403 || e.httpStatus === 404)) {
                    setPermissionsState({ state: "forbidden" });
                    return;
                }
                const error = e instanceof Error ? e.message : "Unknown error loading workspace permissions.";
                setPermissionsState({ state: "error", error });
            });

        return () => {
            cancelled = true;
        };
    }, [backend, workspaceId]);

    return permissionsState;
}
