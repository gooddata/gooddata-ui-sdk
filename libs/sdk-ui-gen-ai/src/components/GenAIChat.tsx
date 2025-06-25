// (C) 2024-2025 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, useBackendStrict, useWorkspaceStrict, WorkspaceProvider } from "@gooddata/sdk-ui";
import { CatalogItem, IColorPalette } from "@gooddata/sdk-model";
import { Provider as StoreProvider } from "react-redux";

import { PermissionsProvider, usePermissions } from "../permissions/index.js";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { ChatEventHandler } from "../store/events.js";

import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { ConfigProvider, LinkHandlerEvent } from "./ConfigContext.js";

/**
 * Properties for the GenAIAssistant component.
 * @public
 */
export interface GenAIAssistantProps {
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
     * Color palette to use for the chat UI.
     */
    colorPalette?: IColorPalette;
    /**
     * Catalog items for autocomplete.
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

    /**
     * When true, allows the chat to render links that open in a new tab or window. This
     * is handy only when embedding the chat in same environment where GD platform is running because
     * chat always create full URLs to the links.
     */
    allowNativeLinks?: boolean;

    /**
     * This will disable manage permissions for the user even if the user has them defined.
     */
    disableManage?: boolean;

    /**
     * This will disable analyze permissions for the user even if the user has them defined.
     */
    disableAnalyze?: boolean;

    /**
     * This will disable full control permissions for the user even if the user has them defined.
     */
    disableFullControl?: boolean;
}

/**
 * Properties for the GenAIChat component.
 * @deprecated This is an old name. Use {@link GenAIAssistantProps} instead.
 * @public
 */
export type GenAIChatProps = GenAIAssistantProps;

/**
 * UI component that renders the Gen AI assistant.
 * @public
 */
export const GenAIAssistant: React.FC<GenAIAssistantProps> = (props) => {
    const { backend, workspace, locale, colorPalette, eventHandlers } = props;
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
                        <PermissionsProvider>
                            <GenAIContent {...props} />
                        </PermissionsProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
};

/**
 * UI component that renders the Gen AI chat.
 * @deprecated This is an old name. Use {@link GenAIAssistant} instead.
 * @public
 */
export const GenAIChat = GenAIAssistant;

const GenAIContent: React.FC<GenAIChatProps> = (props) => {
    const { onLinkClick, catalogItems } = props;
    const { permissions, loading } = usePermissions();

    return (
        <ConfigProvider
            linkHandler={onLinkClick}
            catalogItems={catalogItems}
            allowNativeLinks={props.allowNativeLinks ?? false}
            canFullControl={props.disableFullControl ? false : permissions.canManageProject ?? false}
            canManage={props.disableManage ? false : permissions.canManageProject ?? false}
            canAnalyze={props.disableAnalyze ? false : permissions.canCreateVisualization ?? false}
        >
            <GenAIChatWrapper initializing={loading} />
        </ConfigProvider>
    );
};
