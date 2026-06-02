// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import { UnexpectedResponseError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type ITheme } from "@gooddata/sdk-model";

type WorkspaceThemeState =
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ready"; theme: ITheme | undefined }
    | { state: "forbidden" }
    | { state: "error"; error: string };

export function useWorkspaceTheme(
    backend: IAnalyticalBackend | undefined,
    workspaceId: string | undefined,
): WorkspaceThemeState {
    const [themeState, setThemeState] = useState<WorkspaceThemeState>({ state: "idle" });

    useEffect(() => {
        if (!backend || !workspaceId) {
            setThemeState((prev) => (prev.state === "idle" ? prev : { state: "idle" }));
            return;
        }

        let cancelled = false;
        setThemeState({ state: "loading" });

        backend
            .workspace(workspaceId)
            .styling()
            .getTheme()
            .then((theme) => {
                if (!cancelled) {
                    setThemeState({ state: "ready", theme });
                }
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                if (e instanceof UnexpectedResponseError && (e.httpStatus === 403 || e.httpStatus === 404)) {
                    setThemeState({ state: "forbidden" });
                    return;
                }
                const error = e instanceof Error ? e.message : "Unknown error loading workspace theme.";
                setThemeState({ state: "error", error });
            });

        return () => {
            cancelled = true;
        };
    }, [backend, workspaceId]);

    return themeState;
}
