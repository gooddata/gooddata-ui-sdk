// (C) 2025 GoodData Corporation

import { useState } from "react";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export function useGenAiChatAvailability(
    backend: IAnalyticalBackend,
    workspaceId?: string,
    enabled?: boolean,
    canManage?: boolean,
) {
    const [showGenAiButton, setShowGenAiButton] = useState(false);

    useCancelablePromise(
        {
            promise: () => {
                if (!workspaceId || !enabled || canManage) {
                    return Promise.resolve([]);
                }
                return backend.workspace(workspaceId).genAI().getLlmEndpoints();
            },
            onCancel: () => {
                setShowGenAiButton(false);
            },
            onSuccess: (endpoints) => {
                setShowGenAiButton(Boolean(endpoints.length > 0 || canManage));
            },
        },
        [backend, workspaceId, enabled, canManage],
    );

    return showGenAiButton;
}
