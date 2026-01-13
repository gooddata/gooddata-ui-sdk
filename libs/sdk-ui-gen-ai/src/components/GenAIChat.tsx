// (C) 2024-2025 GoodData Corporation

import { type ComponentType, useEffect } from "react";

import { Provider as StoreProvider } from "react-redux";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type CatalogItem, type GenAIObjectType, type IColorPalette } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { ConfigProvider, type LinkHandlerEvent } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { PermissionsProvider, usePermissions } from "../permissions/index.js";
import { type ChatEventHandler } from "../store/events.js";

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
     * User settings to use for the chat UI.
     */
    settings?: IUserWorkspaceSettings;
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

    /**
     * A list of object types to search for.
     */
    objectTypes?: GenAIObjectType[];
    /**
     * Only objects with these tags will be included
     */
    includeTags?: string[];
    /**
     * Objects with these tags will be excluded
     */
    excludeTags?: string[];

    /**
     * When provided, the function will be called with the store dispatch function
     * after the store has been initialized.
     */
    onDispatcher?: (dispatch: (action: unknown) => void) => void;

    /**
     * Custom React node rendered when no conversation exists yet.
     */
    LandingScreenComponentProvider?: () => ComponentType;
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
export function GenAIAssistant(props: GenAIAssistantProps) {
    const {
        backend,
        workspace,
        locale,
        colorPalette,
        eventHandlers,
        settings,
        objectTypes,
        includeTags,
        excludeTags,
        onDispatcher,
    } = props;
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, {
        colorPalette,
        eventHandlers,
        settings,
        objectTypes,
        includeTags,
        excludeTags,
    });

    useEffect(() => {
        onDispatcher?.(genAIStore.dispatch as (action: unknown) => void);
    }, [genAIStore, onDispatcher]);

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
}

/**
 * UI component that renders the Gen AI chat.
 * @deprecated This is an old name. Use {@link GenAIAssistant} instead.
 * @public
 */
export const GenAIChat = GenAIAssistant;

function GenAIContent(props: GenAIChatProps) {
    const { onLinkClick, catalogItems, LandingScreenComponentProvider } = props;
    const { permissions, loading } = usePermissions();

    return (
        <ConfigProvider
            linkHandler={onLinkClick}
            catalogItems={catalogItems}
            allowNativeLinks={props.allowNativeLinks ?? false}
            canFullControl={props.disableFullControl ? false : (permissions.canManageProject ?? false)}
            canManage={props.disableManage ? false : (permissions.canManageProject ?? false)}
            canAnalyze={props.disableAnalyze ? false : (permissions.canCreateVisualization ?? false)}
        >
            <CustomizationProvider landingScreenComponentProvider={LandingScreenComponentProvider}>
                <GenAIChatWrapper initializing={loading} />
            </CustomizationProvider>
        </ConfigProvider>
    );
}
