// (C) 2024 GoodData Corporation

import React from "react";
import { getStore } from "../store/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Message } from "../model.js";

export const useGenAIStore = (backend: IAnalyticalBackend, workspace: string, history?: Message[]) => {
    const initialHistory = React.useRef<Message[]>(history ?? []);

    // Initialize new Redux Store for each instance of GenAI Chat
    // It OK to discard the store when backend or workspace changes
    return React.useMemo(() => {
        return getStore(backend, workspace, initialHistory.current);
    }, [backend, workspace]);
};
