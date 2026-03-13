// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
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
                    return Promise.resolve(false);
                }
                return backend.workspace(workspaceId).genAI().getLlmConfigured();
            },
            onCancel: () => {
                setShowGenAiButton(false);
            },
            onSuccess: (llmConfigured) => {
                setShowGenAiButton(Boolean((llmConfigured || canManage) && enabled));
            },
        },
        [backend, workspaceId, enabled, canManage],
    );

    return showGenAiButton;
}
