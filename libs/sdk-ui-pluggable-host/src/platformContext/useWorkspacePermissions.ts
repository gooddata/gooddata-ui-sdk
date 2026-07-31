// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { classifyWorkspaceAccessError } from "./workspaceAccess.js";

type WorkspacePermissionsState =
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ready"; permissions: IWorkspacePermissions }
    | { state: "forbidden" }
    | { state: "error"; error: string };

const IDLE: WorkspacePermissionsState = { state: "idle" };
const LOADING: WorkspacePermissionsState = { state: "loading" };

/** Loaded state together with the backend and workspace it belongs to. */
interface IPermissionsSnapshot {
    backend: IAnalyticalBackend | undefined;
    workspaceId: string | undefined;
    state: WorkspacePermissionsState;
}

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
    const [snapshot, setSnapshot] = useState<IPermissionsSnapshot>({
        backend: undefined,
        workspaceId: undefined,
        state: IDLE,
    });

    useEffect(() => {
        if (!backend || !workspaceId) {
            setSnapshot((prev) =>
                prev.state === IDLE && prev.backend === undefined && prev.workspaceId === undefined
                    ? prev
                    : { backend: undefined, workspaceId: undefined, state: IDLE },
            );
            return;
        }

        let cancelled = false;
        setSnapshot({ backend, workspaceId, state: LOADING });

        const update = (state: WorkspacePermissionsState) => {
            if (!cancelled) {
                setSnapshot({ backend, workspaceId, state });
            }
        };

        backend
            .workspace(workspaceId)
            .permissions()
            .getPermissionsForCurrentUser()
            .then((permissions) => {
                update({ state: "ready", permissions });
            })
            .catch((e: unknown) => {
                // No access signals "forbidden" rather than an error, so the platform context
                // reaches "ready" with undefined permissions and the mounted app can render its
                // own access-denied UI. The 403/404 rule itself lives in workspaceAccess.ts,
                // shared with the redirect resolver.
                if (classifyWorkspaceAccessError(e) === "forbidden") {
                    update({ state: "forbidden" });
                    return;
                }
                const error = e instanceof Error ? e.message : "Unknown error loading workspace permissions.";
                update({ state: "error", error });
            });

        return () => {
            cancelled = true;
        };
    }, [backend, workspaceId]);

    if (!backend || !workspaceId) {
        return IDLE;
    }

    // A backend or workspaceId change is reported as "loading" from the very first render: the
    // fetch effect runs a beat later, and until it does the stored state still describes the
    // PREVIOUS backend/workspace. Callers gate on this state to decide what the current
    // workspace allows, so handing them permissions from another workspace — or from a
    // previous session's backend — even for one render is a correctness bug.
    return snapshot.backend === backend && snapshot.workspaceId === workspaceId ? snapshot.state : LOADING;
}
