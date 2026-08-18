// (C) 2024-2026 GoodData Corporation

import { type PayloadAction, type Reducer, createSlice } from "@reduxjs/toolkit";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type GenAIObjectType,
    type IAllowedRelationshipType,
    type IColorPalette,
    type IDashboard,
    type IGenAIUserContext,
    type IInsight,
    type IListedDashboard,
    isIdentifierRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

import { addAmbientContextReferences, addContextReference } from "../../context/addContextReference.js";
import { mergeContexts } from "../../context/build.js";
import { removeContextReference, removeUserContextReferences } from "../../context/removeContextReference.js";
import {
    type ContextDashboardsState,
    type IGenAIContextObject,
    type IGenAIDashboardListItem,
    type StoreContext,
} from "../../types.js";
import { clearThreadAction, startNewConversationAction } from "../messages/messagesSlice.js";

type ChatWindowSliceState = {
    /**
     * Defines if the chat window is open.
     */
    isOpen: boolean;
    /**
     * Defines if the chat window is in fullscreen mode.
     */
    isFullscreen: boolean;
    /**
     * Indicates whether history panel is open.
     */
    isHistory: boolean;
    /**
     * Color palette to use for the chat UI.
     */
    colorPalette?: IColorPalette;
    /**
     * Settings to use for the chat UI.
     */
    settings?: IUserWorkspaceSettings;
    /**
     * Key driver analysis to use for the chat UI.
     */
    keyDriverAnalysis?: IKdaDefinition;
    /**
     * Indicates whether key driver analysis panel is minimized.
     */
    keyDriverAnalysisMinimized?: boolean;
    /**
     * Object types to use for the chat UI.
     */
    objectTypes?: GenAIObjectType[];
    /**
     * Catalog items for autocomplete.
     */
    catalogItems?: CatalogItem[];
    /**
     * Dashboards offered by the context chooser, on top of the one being viewed.
     */
    contextDashboards: ContextDashboardsState;
    /**
     * Only objects with these tags will be included
     */
    includeTags?: string[];
    /**
     * Objects with these tags will be excluded
     */
    excludeTags?: string[];
    /**
     * Allowed relationship types for semantic search (e.g. for view-only users).
     */
    allowedRelationshipTypes?: IAllowedRelationshipType[];
    /**
     * Context related to the chat.
     */
    context: StoreContext;
    /**
     * Whether the chat runs against the caller's preview agent. In preview mode the assistant
     * is pinned to that single agent, so agent switching is not applicable.
     */
    isPreview?: boolean;
    /**
     * Whether the plug-in instance allows the Interaction Intelligence panel. Combined with
     * `settings.enableGenAiInteractionIntelligence` — both must be true for the panel to show.
     */
    allowInteractionIntelligence?: boolean;
};

export const chatWindowSliceName = "chatWindow";

function toDashboardListItem(dashboard: IListedDashboard): IGenAIDashboardListItem {
    const ref = dashboard.ref;

    return {
        id: isIdentifierRef(ref) ? ref.identifier : ref.uri,
        ref,
        title: dashboard.title,
    };
}

const initialState: ChatWindowSliceState = {
    isOpen: false,
    isHistory: false,
    isFullscreen: false,
    colorPalette: undefined,
    settings: undefined,
    objectTypes: undefined,
    includeTags: undefined,
    excludeTags: undefined,
    allowedRelationshipTypes: undefined,
    contextDashboards: {
        items: [],
        loadedPages: 0,
        hasNextPage: true,
        isLoading: false,
    },
    context: {
        ambient: undefined,
        active: undefined,
    },
    isPreview: undefined,
    allowInteractionIntelligence: undefined,
};

export const getInitialChatWindowState = ({
    isPreview,
    allowInteractionIntelligence,
}: {
    isPreview?: boolean;
    allowInteractionIntelligence?: boolean;
} = {}): ChatWindowSliceState => ({
    ...initialState,
    contextDashboards: { ...initialState.contextDashboards, items: [] },
    isPreview,
    allowInteractionIntelligence,
});

const chatWindowSlice = createSlice({
    name: chatWindowSliceName,
    initialState: getInitialChatWindowState(),
    reducers: {
        setOpenAction: (state, { payload: { isOpen } }: PayloadAction<{ isOpen: boolean }>) => {
            state.isOpen = isOpen;
        },
        setFullscreenAction: (
            state,
            { payload: { isFullscreen } }: PayloadAction<{ isFullscreen: boolean }>,
        ) => {
            state.isFullscreen = isFullscreen;
        },
        setHistoryAction: (state, { payload: { isHistory } }: PayloadAction<{ isHistory: boolean }>) => {
            state.isHistory = isHistory;
        },
        setColorPaletteAction: (
            state,
            { payload: { colorPalette } }: PayloadAction<{ colorPalette?: IColorPalette }>,
        ) => {
            state.colorPalette = colorPalette;
        },
        setSettingsAction: (
            state,
            { payload: { settings } }: PayloadAction<{ settings?: IUserWorkspaceSettings }>,
        ) => {
            state.settings = settings;
        },
        setKeyDriverAnalysisAction: (
            state,
            { payload: { keyDriverAnalysis } }: PayloadAction<{ keyDriverAnalysis?: IKdaDefinition }>,
        ) => {
            state.keyDriverAnalysis = keyDriverAnalysis;
            if (!keyDriverAnalysis) {
                state.keyDriverAnalysisMinimized = false;
            }
        },
        setKeyDriverAnalysisMinimizedAction: (
            state,
            { payload: { minimized } }: PayloadAction<{ minimized?: boolean }>,
        ) => {
            state.keyDriverAnalysisMinimized = minimized;
        },
        setObjectTypesAction: (
            state,
            { payload: { objectTypes } }: PayloadAction<{ objectTypes?: GenAIObjectType[] }>,
        ) => {
            state.objectTypes = objectTypes;
        },
        setTagsAction: (
            state,
            {
                payload: { includeTags, excludeTags },
            }: PayloadAction<{ includeTags?: string[]; excludeTags?: string[] }>,
        ) => {
            state.includeTags = includeTags;
            state.excludeTags = excludeTags;
        },
        setCatalogItemsActions: (state, { payload }: PayloadAction<CatalogItem[] | undefined>) => {
            state.catalogItems = payload;
        },
        initContextDashboardsAction: (state) => state,
        loadContextDashboardsNextPageAction: (state) => state,
        setContextDashboardsAction: (
            state,
            { payload: { items } }: PayloadAction<{ items: IListedDashboard[] }>,
        ) => {
            state.contextDashboards = {
                items: items.map(toDashboardListItem),
                loadedPages: 1,
                hasNextPage: false,
                isLoading: false,
            };
        },
        contextDashboardsLoadingAction: (state) => {
            state.contextDashboards.isLoading = true;
        },
        contextDashboardsPageLoadedAction: (
            state,
            {
                payload: { items, hasNextPage },
            }: PayloadAction<{ items: IListedDashboard[]; hasNextPage: boolean }>,
        ) => {
            const known = new Set(state.contextDashboards.items.map((item) => serializeObjRef(item.ref)));
            const newItems = items.map(toDashboardListItem).filter((item) => {
                const refKey = serializeObjRef(item.ref);

                if (known.has(refKey)) {
                    return false;
                }

                known.add(refKey);
                return true;
            });

            state.contextDashboards.items.push(...newItems);
            state.contextDashboards.loadedPages += 1;
            state.contextDashboards.hasNextPage = hasNextPage;
            state.contextDashboards.isLoading = false;
        },
        contextDashboardsLoadFailedAction: (state) => {
            state.contextDashboards.isLoading = false;
        },
        setAllowedRelationshipTypesAction: (
            state,
            {
                payload: { allowedRelationshipTypes },
            }: PayloadAction<{ allowedRelationshipTypes?: IAllowedRelationshipType[] }>,
        ) => {
            state.allowedRelationshipTypes = allowedRelationshipTypes;
        },
        setUserContextAction: (
            state,
            {
                payload: { userContext, replaceUserContext },
            }: PayloadAction<{ userContext?: IGenAIUserContext; replaceUserContext?: boolean }>,
        ) => {
            if (replaceUserContext) {
                state.context.active = mergeContexts(
                    removeUserContextReferences(state.context.active),
                    userContext,
                );
            } else {
                state.context.active = mergeContexts(state.context.active, userContext);
            }
        },
        setAmbientUserContextAction: (
            state,
            { payload: { userContext } }: PayloadAction<{ userContext?: IGenAIUserContext }>,
        ) => {
            if (!state.settings?.enableAiContextSetup) {
                if (!userContext) {
                    state.context.active = undefined;
                }
                return;
            }
            state.context = addAmbientContextReferences(state.context, userContext);
        },
        addContextReferenceAction: (
            state,
            { payload: { object } }: PayloadAction<{ object: IGenAIContextObject }>,
        ) => {
            state.context = addContextReference(state.context, object);
        },
        removeContextReferenceAction: (
            state,
            { payload: { object } }: PayloadAction<{ object: IGenAIContextObject }>,
        ) => {
            state.context.active = removeContextReference(state.context.active, object);
        },
        setIsPreviewAction: (state, { payload: { isPreview } }: PayloadAction<{ isPreview?: boolean }>) => {
            state.isPreview = isPreview;
        },
        onDefinitionReceivedAction: (
            state,
            _action: PayloadAction<{
                definitionType: "dashboard" | "visualization";
                conversationId: string;
                itemId: string;
                interactionId?: string;
                dashboard?: IDashboard;
                insights?: IInsight[];
                visualization?: IInsight;
            }>,
        ) => state,
        copyToClipboardAction: (state, _action: PayloadAction<{ content: string }>) => state,
    },
    extraReducers: (builder) => {
        const resetContextToAmbient = (state: ChatWindowSliceState) => {
            state.context.active = mergeContexts(state.context.ambient);
        };

        builder
            .addCase(startNewConversationAction, resetContextToAmbient)
            .addCase(clearThreadAction, resetContextToAmbient);
    },
});

export const chatWindowSliceReducer: Reducer<ChatWindowSliceState> = chatWindowSlice.reducer;
export const {
    setOpenAction,
    setHistoryAction,
    setColorPaletteAction,
    setSettingsAction,
    copyToClipboardAction,
    setKeyDriverAnalysisAction,
    setKeyDriverAnalysisMinimizedAction,
    setObjectTypesAction,
    setTagsAction,
    setCatalogItemsActions,
    initContextDashboardsAction,
    loadContextDashboardsNextPageAction,
    setContextDashboardsAction,
    contextDashboardsLoadingAction,
    contextDashboardsPageLoadedAction,
    contextDashboardsLoadFailedAction,
    setAllowedRelationshipTypesAction,
    onDefinitionReceivedAction,
    addContextReferenceAction,
    removeContextReferenceAction,
    setIsPreviewAction,
    /**
     * Switches the assistant between the docked and the fullscreen layout.
     * @public
     */
    setFullscreenAction,
    /**
     * @public
     */
    setAmbientUserContextAction,
    /**
     * @public
     */
    setUserContextAction,
} = chatWindowSlice.actions;
