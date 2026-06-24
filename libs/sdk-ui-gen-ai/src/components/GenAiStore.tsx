// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useContext, useEffect, useState } from "react";

import { type EnhancedStore, type Store } from "@reduxjs/toolkit";
import { ReactReduxContext, Provider as StoreProvider } from "react-redux";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type CatalogItem, type GenAIObjectType, type IColorPalette } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { chatWindowSliceName } from "../store/chatWindow/chatWindowSlice.js";
import { type ChatEventHandler } from "../store/events.js";
import { messagesSliceName } from "../store/messages/messagesSlice.js";

import { ConfigProvider, type LinkHandlerEvent } from "./ConfigContext.js";

/**
 * Props for the GenAiStore component.
 * @public
 */
export type GenAiStoreProps = {
    /**
     * Store to use for the GenAiStore component.
     */
    providedStore?: Promise<Store>;
    /**
     * Analytical backend to use for server communication.
     */
    backend?: IAnalyticalBackend;
    /**
     * The workspace ID the user is working with.
     */
    workspace?: string;
    /**
     * Catalog items for autocomplete.
     */
    catalogItems?: CatalogItem[];
    /**
     * User settings to use for the chat UI.
     */
    settings?: IUserWorkspaceSettings;

    /**
     * Callback to handle link clicks.
     */
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => string | undefined;
    /**
     * Whether to allow native links to be opened in a new tab.
     */
    allowNativeLinks?: boolean;
    /**
     * Event handlers to subscribe to chat events.
     */
    eventHandlers?: ChatEventHandler[];
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
     * Color palette to use for the chat UI.
     */
    colorPalette?: IColorPalette;
    /**
     * When provided, the function will be called with the store dispatch function
     * after the store has been initialized.
     */
    onDispatcher?: (dispatch: EnhancedStore["dispatch"]) => void;
    /**
     * Render function or component to be wrapped with the Gen AI store.
     */
    children: ReactNode | ((genAIStore: EnhancedStore) => ReactNode);

    /**
     * When `true`, the assistant operates against the caller's preview agent
     * for this workspace (backend agent id: `{userId}-{workspaceId}-preview`).
     * New conversations are created as preview conversations and the
     * conversation list is filtered to preview conversations only.
     *
     * The preview agent must already exist and be enabled; otherwise
     * conversation creation will fail.
     *
     * Note: toggling this prop rebuilds the chat state from scratch.
     *
     * @internal
     */
    isPreview?: boolean;
};

/**
 * Provides the Gen AI store to the application.
 * @public
 */
export function GenAiStore(props: GenAiStoreProps) {
    const [externalStore, setExternalStore] = useState<EnhancedStore | null | undefined>(undefined);
    const [injectedStore, setInjectedStore] = useState<EnhancedStore | null | undefined>(undefined);
    const { children, providedStore } = props;

    const reduxContext = useContext(ReactReduxContext);

    useEffect(() => {
        async function handler() {
            if (providedStore) {
                setInjectedStore(await providedStore);
                setExternalStore(null);
            } else if (reduxContext?.store && isGenAiStore(reduxContext.store)) {
                setExternalStore(reduxContext.store);
                setInjectedStore(null);
            } else {
                setExternalStore(null);
                setInjectedStore(null);
            }
        }
        void handler();
    }, [reduxContext?.store, providedStore]);

    //Stores aren't evaluated yet
    if (externalStore === undefined || injectedStore === undefined) {
        return null;
    }

    if (externalStore) {
        return (
            <ConfigProvider allowNativeLinks={props.allowNativeLinks} linkHandler={props.onLinkClick}>
                <ExternalStore {...props} currentStore={externalStore}>
                    {children}
                </ExternalStore>
            </ConfigProvider>
        );
    }
    if (injectedStore) {
        return (
            <ConfigProvider allowNativeLinks={props.allowNativeLinks} linkHandler={props.onLinkClick}>
                <InjectedStore {...props} currentStore={injectedStore}>
                    {children}
                </InjectedStore>
            </ConfigProvider>
        );
    }
    return (
        <ConfigProvider allowNativeLinks={props.allowNativeLinks} linkHandler={props.onLinkClick}>
            <InternalStore {...props}>{children}</InternalStore>
        </ConfigProvider>
    );
}

function ExternalStore({
    onDispatcher,
    children,
    currentStore,
}: GenAiStoreProps & { currentStore: EnhancedStore }) {
    useEffect(() => {
        onDispatcher?.(currentStore.dispatch);
    }, [currentStore, onDispatcher]);

    const content = typeof children === "function" ? children(currentStore) : children;
    return <>{content}</>;
}

function InjectedStore({
    onDispatcher,
    children,
    currentStore,
}: GenAiStoreProps & { currentStore: EnhancedStore }) {
    useEffect(() => {
        onDispatcher?.(currentStore.dispatch);
    }, [currentStore, onDispatcher]);

    const content = typeof children === "function" ? children(currentStore) : children;
    return <StoreProvider store={currentStore}>{content}</StoreProvider>;
}

function InternalStore({
    backend,
    workspace,
    onDispatcher,
    children,
    eventHandlers,
    settings,
    catalogItems,
    includeTags,
    excludeTags,
    objectTypes,
    allowNativeLinks,
    onLinkClick,
    isPreview,
    colorPalette,
}: GenAiStoreProps) {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, {
        colorPalette,
        eventHandlers,
        settings,
        objectTypes,
        includeTags,
        excludeTags,
        catalogItems,
        isPreview,
        allowNativeLinks,
        onLinkClick,
    });

    useEffect(() => {
        onDispatcher?.(genAIStore.dispatch);
    }, [genAIStore, onDispatcher]);

    const content = typeof children === "function" ? children(genAIStore) : children;
    return <StoreProvider store={genAIStore}>{content}</StoreProvider>;
}

function isGenAiStore(store: EnhancedStore): boolean {
    const state = store.getState();

    if (!state || typeof state !== "object") {
        return false;
    }

    return chatWindowSliceName in state && messagesSliceName in state;
}
