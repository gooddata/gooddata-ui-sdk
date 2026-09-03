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
    serializeObjRef,
} from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

import { addContextReference } from "../../context/addContextReference.js";
import { mergeContexts } from "../../context/build.js";
import { removeContextReference } from "../../context/removeContextReference.js";
import { selectContextReferences, updateAmbientContext } from "../../context/selectContextReferences.js";
import {
    type ContextObjectKind,
    type ContextObjectListState,
    type ContextObjectsState,
    type IGenAIContextListItem,
    type IGenAIContextObject,
    type SelectedContext,
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
     * Dashboards and visualizations offered by the context chooser, on top of the ambient ones.
     */
    contextObjects: ContextObjectsState;
    /**
     * Title the context chooser lists are filtered by. Empty means no filter.
     */
    contextObjectsSearch: string;
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

function emptyContextObjectList(isExternal = false): ContextObjectListState {
    return {
        items: [],
        loadedPages: 0,
        hasNextPage: true,
        isLoading: false,
        isExternal,
    };
}

function emptyContextObjects(): ContextObjectsState {
    return {
        dashboard: emptyContextObjectList(),
        visualization: emptyContextObjectList(),
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
    contextObjects: emptyContextObjects(),
    contextObjectsSearch: "",
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
    contextObjects: emptyContextObjects(),
    contextObjectsSearch: "",
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
        initContextObjectsAction: (state) => state,
        loadContextObjectsNextPageAction: (state, _action: PayloadAction<{ kind: ContextObjectKind }>) =>
            state,
        setContextObjectsAction: (
            state,
            {
                payload: { kind, items },
            }: PayloadAction<{ kind: ContextObjectKind; items: IGenAIContextListItem[] }>,
        ) => {
            state.contextObjects[kind] = {
                items,
                loadedPages: 1,
                hasNextPage: false,
                isLoading: false,
                isExternal: true,
            };
        },
        setContextObjectsSearchAction: (
            state,
            { payload: { search } }: PayloadAction<{ search: string }>,
        ) => {
            state.contextObjectsSearch = search;

            (["dashboard", "visualization"] as ContextObjectKind[]).forEach((kind) => {
                if (!state.contextObjects[kind].isExternal) {
                    state.contextObjects[kind] = emptyContextObjectList();
                }
            });
        },
        contextObjectsLoadingAction: (
            state,
            { payload: { kind } }: PayloadAction<{ kind: ContextObjectKind }>,
        ) => {
            state.contextObjects[kind].isLoading = true;
        },
        contextObjectsPageLoadedAction: (
            state,
            {
                payload: { kind, items, hasNextPage },
            }: PayloadAction<{
                kind: ContextObjectKind;
                items: IGenAIContextListItem[];
                hasNextPage: boolean;
            }>,
        ) => {
            const list = state.contextObjects[kind];
            const known = new Set(list.items.map((item) => serializeObjRef(item.ref)));
            const newItems = items.filter((item) => {
                const refKey = serializeObjRef(item.ref);

                if (known.has(refKey)) {
                    return false;
                }

                known.add(refKey);
                return true;
            });

            list.items.push(...newItems);
            list.loadedPages += 1;
            list.hasNextPage = hasNextPage;
            list.isLoading = false;
        },
        contextObjectsLoadFailedAction: (
            state,
            { payload: { kind } }: PayloadAction<{ kind: ContextObjectKind }>,
        ) => {
            state.contextObjects[kind].isLoading = false;
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
                state.context.active = userContext;
                state.context = selectContextReferences(state.context, state.context.ambientSelected);
            } else {
                state.context.active = mergeContexts(state.context.active, userContext);
            }
        },
        setAmbientUserContextAction: (
            state,
            {
                payload: { userContext, loading },
            }: PayloadAction<{ userContext?: IGenAIUserContext; loading?: boolean }>,
        ) => {
            if (!state.settings?.enableAiContextSetup) {
                if (!userContext) {
                    state.context.active = undefined;
                }
                return;
            }
            state.context = updateAmbientContext(state.context, userContext, loading);
        },
        addContextReferenceAction: (
            state,
            { payload: { object } }: PayloadAction<{ object: IGenAIContextObject }>,
        ) => {
            state.context = addContextReference(state.context, object);
        },
        selectedContextReferencesAction: (state, { payload }: PayloadAction<SelectedContext>) => {
            state.context = selectContextReferences(state.context, payload);
        },
        removeContextReferenceAction: (
            state,
            { payload: { object } }: PayloadAction<{ object: IGenAIContextObject }>,
        ) => {
            state.context = removeContextReference(state.context, object);
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
    initContextObjectsAction,
    loadContextObjectsNextPageAction,
    setContextObjectsAction,
    setContextObjectsSearchAction,
    contextObjectsLoadingAction,
    contextObjectsPageLoadedAction,
    contextObjectsLoadFailedAction,
    setAllowedRelationshipTypesAction,
    onDefinitionReceivedAction,
    addContextReferenceAction,
    removeContextReferenceAction,
    selectedContextReferencesAction,
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
