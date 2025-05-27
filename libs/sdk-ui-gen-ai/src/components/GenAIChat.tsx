// (C) 2024-2025 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, useBackendStrict, useWorkspaceStrict, WorkspaceProvider } from "@gooddata/sdk-ui";
import { CatalogItem, IColorPalette } from "@gooddata/sdk-model";
import { Provider as StoreProvider } from "react-redux";

import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { ChatEventHandler } from "../store/events.js";

import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { ConfigProvider, LinkHandlerEvent } from "./ConfigContext.js";

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
     * The locale to use for the chat UI.
     */
    locale?: string;
    /**
     * Whether the user can manage objects in the workspace.
     */
    canManage?: boolean;
    /**
     * Whether the user can analyze data in the workspace.
     */
    canAnalyze?: boolean;
    /**
     * Color palette to use for the chat UI.
     */
    colorPalette?: IColorPalette;
    /**
     * Catalog items to use for the chat UI.
     */
    catalogItems?: CatalogItem[];
    /**
     * Event handlers to subscribe to chat events.
     */
    eventHandlers?: ChatEventHandler[];
    /**
     * When provided, references to the metadata objects will be rendered as clickable links.
     * Otherwise, the metadata objects will be rendered as plain text (using object title).
     */
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => void;
}

/**
 * UI component that renders the Gen AI chat.
 * @alpha
 */
export const GenAIChat: React.FC<GenAIChatProps> = ({
    backend,
    workspace,
    locale,
    colorPalette,
    catalogItems,
    eventHandlers,
    canManage,
    canAnalyze,
    onLinkClick,
}) => {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, {
        colorPalette,
        eventHandlers,
    });

    return (
        <IntlWrapper locale={locale}>
            <StoreProvider store={genAIStore}>
                <BackendProvider backend={effectiveBackend}>
                    <WorkspaceProvider workspace={effectiveWorkspace}>
                        <ConfigProvider
                            allowCreateVisualization={canManage ?? false}
                            allowNativeLinks={false}
                            linkHandler={onLinkClick}
                            catalogItems={catalogItems}
                            canManage={canManage}
                            canAnalyze={canAnalyze}
                        >
                            <GenAIChatWrapper />
                        </ConfigProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
};
