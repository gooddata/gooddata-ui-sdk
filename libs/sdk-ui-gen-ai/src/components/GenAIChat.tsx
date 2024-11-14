// (C) 2024 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Provider as StoreProvider } from "react-redux";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { BackendProvider, useBackendStrict, useWorkspaceStrict, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ChatEventHandler } from "../store/events.js";

/**
 * Properties for the GenAIChat component.
 * @alpha
 */
export interface GenAIChatProps {
    /**
     * Analytical backend to use for server communication.
     */
    backend?: IAnalyticalBackend;
    /**
     * The workspace ID the user is working with.
     */
    workspace?: string;
    /**
     * Event handlers to subscribe to chat events.
     */
    eventHandlers?: ChatEventHandler[];
}

/**
 * UI component that renders the Gen AI chat.
 * @alpha
 */
export const GenAIChat: React.FC<GenAIChatProps> = ({ backend, workspace, eventHandlers }) => {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, eventHandlers);

    return (
        <IntlWrapper>
            <StoreProvider store={genAIStore}>
                <BackendProvider backend={effectiveBackend}>
                    <WorkspaceProvider workspace={effectiveWorkspace}>
                        <GenAIChatWrapper />
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
};
