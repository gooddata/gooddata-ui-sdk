// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import {
    UnexpectedResponseError,
    type IAnalyticalBackend,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

type WorkspaceSettingsState =
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ready"; settings: IUserWorkspaceSettings }
    | { state: "forbidden" }
    | { state: "error"; error: string };

/**
 * Loads effective workspace-scoped settings for the current user.
 *
 * @remarks
 * Returns `"idle"` when `backend` or `workspaceId` is absent.
 * Re-fetches whenever `workspaceId` changes.
 *
 * @internal
 */
export function useWorkspaceSettings(
    backend: IAnalyticalBackend | undefined,
    workspaceId: string | undefined,
): WorkspaceSettingsState {
    const [settingsState, setSettingsState] = useState<WorkspaceSettingsState>({ state: "idle" });

    useEffect(() => {
        if (!backend || !workspaceId) {
            setSettingsState((prev) => (prev.state === "idle" ? prev : { state: "idle" }));
            return;
        }

        let cancelled = false;
        setSettingsState({ state: "loading" });

        backend
            .workspace(workspaceId)
            .settings()
            .getSettingsForCurrentUser()
            .then((settings) => {
                if (!cancelled) {
                    setSettingsState({ state: "ready", settings });
                }
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                if (e instanceof UnexpectedResponseError && (e.httpStatus === 403 || e.httpStatus === 404)) {
                    setSettingsState({ state: "forbidden" });
                    return;
                }
                const error = e instanceof Error ? e.message : "Unknown error loading workspace settings.";
                setSettingsState({ state: "error", error });
            });

        return () => {
            cancelled = true;
        };
    }, [backend, workspaceId]);

    return settingsState;
}
