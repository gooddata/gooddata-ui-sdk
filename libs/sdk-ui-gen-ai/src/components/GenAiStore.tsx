// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useContext, useEffect } from "react";

import { type EnhancedStore } from "@reduxjs/toolkit";
import { ReactReduxContext, Provider as StoreProvider } from "react-redux";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type CatalogItem, type GenAIObjectType, type IColorPalette } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { chatWindowSliceName } from "../store/chatWindow/chatWindowSlice.js";
import { type ChatEventHandler } from "../store/events.js";
import { messagesSliceName } from "../store/messages/messagesSlice.js";

/**
 * Props for the GenAiStore component.
 * @public
 */
export type GenAiStoreProps = {
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
    const { children } = props;

    const reduxContext = useContext(ReactReduxContext);
    const contextStore = reduxContext?.store as EnhancedStore | undefined;
    const hasGenAiContextStore = contextStore ? isGenAiStore(contextStore) : false;

    if (hasGenAiContextStore) {
        return <ExternalStore {...props}>{children}</ExternalStore>;
    }
    return <InternalStore {...props}>{children}</InternalStore>;
}

function ExternalStore({ onDispatcher, children }: GenAiStoreProps) {
    const reduxContext = useContext(ReactReduxContext);
    const contextStore = reduxContext?.store as EnhancedStore | undefined;

    useEffect(() => {
        if (contextStore) {
            onDispatcher?.(contextStore.dispatch);
        }
    }, [contextStore, onDispatcher]);

    if (!contextStore) {
        return null;
    }

    const content = typeof children === "function" ? children(contextStore) : children;
    return <>{content}</>;
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
