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
) {
    const [showGenAiButton, setShowGenAiButton] = useState(false);

    useCancelablePromise(
        {
            promise: () => {
                if (!workspaceId || !enabled) {
                    return Promise.resolve([]);
                }
                return backend.workspace(workspaceId).genAI().getLlmEndpoints();
            },
            onCancel: () => {
                setShowGenAiButton(false);
            },
            onSuccess: (endpoints) => {
                setShowGenAiButton(endpoints.length > 0);
            },
        },
        [backend, workspaceId, enabled],
    );

    return showGenAiButton;
}
