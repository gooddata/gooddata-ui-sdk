// (C) 2024-2026 GoodData Corporation

import { type PayloadAction, type Reducer, createSlice } from "@reduxjs/toolkit";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type GenAIObjectType,
    type IAllowedRelationshipType,
    type IColorPalette,
    type IGenAIUserContext,
} from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

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
     * Object types to use for the chat UI.
     */
    objectTypes?: GenAIObjectType[];
    /**
     * Catalog items for autocomplete.
     */
    catalogItems?: CatalogItem[];
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
     * One-shot user context for the next message (e.g. active visualization).
     * Cleared after being consumed by the saga.
     */
    userContext?: IGenAIUserContext;
    /**
     * Whether the chat runs against the caller's preview agent. In preview mode the assistant
     * is pinned to that single agent, so agent switching is not applicable.
     */
    isPreview?: boolean;
};

export const chatWindowSliceName = "chatWindow";

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
    userContext: undefined,
    isPreview: undefined,
};

export const getInitialChatWindowState = ({
    isPreview,
}: {
    isPreview?: boolean;
} = {}): ChatWindowSliceState => ({
    ...initialState,
    isPreview,
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
            { payload: { userContext } }: PayloadAction<{ userContext?: IGenAIUserContext }>,
        ) => {
            state.userContext = userContext;
        },
        clearUserContextAction: (state) => {
            state.userContext = undefined;
        },
        setIsPreviewAction: (state, { payload: { isPreview } }: PayloadAction<{ isPreview?: boolean }>) => {
            state.isPreview = isPreview;
        },
        copyToClipboardAction: (state, _action: PayloadAction<{ content: string }>) => state,
    },
});

export const chatWindowSliceReducer: Reducer<ChatWindowSliceState> = chatWindowSlice.reducer;
export const {
    setOpenAction,
    setFullscreenAction,
    setHistoryAction,
    setColorPaletteAction,
    setSettingsAction,
    copyToClipboardAction,
    setKeyDriverAnalysisAction,
    setObjectTypesAction,
    setTagsAction,
    setCatalogItemsActions,
    setAllowedRelationshipTypesAction,
    setUserContextAction,
    clearUserContextAction,
    setIsPreviewAction,
} = chatWindowSlice.actions;
