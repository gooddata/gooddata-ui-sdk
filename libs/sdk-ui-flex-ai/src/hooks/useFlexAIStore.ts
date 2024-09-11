// (C) 2024 GoodData Corporation
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import React from "react";
import { getStore } from "../store/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Message } from "../model.js";

export const useFlexAIStore = (backend?: IAnalyticalBackend, workspace?: string, history?: Message[]) => {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const initialHistory = React.useRef<Message[]>(history ?? []);

    // Initialize new Redux Store for each instance of FlexAIChat
    // It OK to discard the store when backend or workspace changes
    return React.useMemo(() => {
        return getStore(effectiveBackend, effectiveWorkspace, initialHistory.current);
    }, [effectiveBackend, effectiveWorkspace]);
};
