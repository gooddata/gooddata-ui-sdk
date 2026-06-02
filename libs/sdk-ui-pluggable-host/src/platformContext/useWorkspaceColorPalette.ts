// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import { UnexpectedResponseError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IColorPalette } from "@gooddata/sdk-model";

type WorkspaceColorPaletteState =
    | { state: "idle" }
    | { state: "loading" }
    | { state: "ready"; colorPalette: IColorPalette | undefined }
    | { state: "forbidden" }
    | { state: "error"; error: string };

export function useWorkspaceColorPalette(
    backend: IAnalyticalBackend | undefined,
    workspaceId: string | undefined,
): WorkspaceColorPaletteState {
    const [paletteState, setPaletteState] = useState<WorkspaceColorPaletteState>({ state: "idle" });

    useEffect(() => {
        if (!backend || !workspaceId) {
            setPaletteState((prev) => (prev.state === "idle" ? prev : { state: "idle" }));
            return;
        }

        let cancelled = false;
        setPaletteState({ state: "loading" });

        backend
            .workspace(workspaceId)
            .styling()
            .getColorPalette()
            .then((colorPalette) => {
                if (!cancelled) {
                    setPaletteState({ state: "ready", colorPalette });
                }
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                if (e instanceof UnexpectedResponseError && (e.httpStatus === 403 || e.httpStatus === 404)) {
                    setPaletteState({ state: "forbidden" });
                    return;
                }
                const error =
                    e instanceof Error ? e.message : "Unknown error loading workspace color palette.";
                setPaletteState({ state: "error", error });
            });

        return () => {
            cancelled = true;
        };
    }, [backend, workspaceId]);

    return paletteState;
}
