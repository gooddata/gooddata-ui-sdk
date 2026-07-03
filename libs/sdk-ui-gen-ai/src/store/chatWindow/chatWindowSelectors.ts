// (C) 2024-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type GenAIObjectType,
    type IAllowedRelationshipType,
    type IColorPalette,
    type IGenAIUserContext,
} from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

import { type RootState } from "../types.js";

import { chatWindowSliceName } from "./chatWindowSlice.js";

const chatWindowSliceSelector = (state: RootState) => state[chatWindowSliceName];

export const isOpenSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isOpen,
);

export const isFullscreenSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isFullscreen,
);

export const isHistorySelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isHistory,
);

export const colorPaletteSelector: (state: RootState) => IColorPalette | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.colorPalette,
);

export const settingsSelector: (state: RootState) => IUserWorkspaceSettings | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.settings,
);

export const isPreviewSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isPreview === true,
);

export const agentSwitchingEnabledSelector: (state: RootState) => boolean = createSelector(
    settingsSelector,
    (settings) => settings?.["enableGenAiAgentSwitching"] === true,
);

// Whether the agent switcher is usable in the current chat context. It is never usable in preview
// mode: the assistant is pinned to the single preview agent being built, so the switcher stays
// hidden and the legacy input is used.
export const agentSwitchingActiveSelector: (state: RootState) => boolean = createSelector(
    agentSwitchingEnabledSelector,
    isPreviewSelector,
    (agentSwitchingEnabled, isPreview) => agentSwitchingEnabled && !isPreview,
);

export const objectTypesSelector: (state: RootState) => GenAIObjectType[] | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.objectTypes,
);

export const allowedRelationshipTypesSelector: (state: RootState) => IAllowedRelationshipType[] | undefined =
    createSelector(chatWindowSliceSelector, (state) => state.allowedRelationshipTypes);

export const tagsSelector: (state: RootState) => {
    includeTags: string[] | undefined;
    excludeTags: string[] | undefined;
} = createSelector(chatWindowSliceSelector, (state) => {
    return {
        includeTags: state.includeTags,
        excludeTags: state.excludeTags,
    };
});

export const catalogItemsSelector: (state: RootState) => CatalogItem[] = createSelector(
    chatWindowSliceSelector,
    (state) => {
        return state.catalogItems ?? [];
    },
);

export const keyDriverAnalysisSelector: (state: RootState) => IKdaDefinition | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.keyDriverAnalysis,
);

export const keyDriverAnalysisMinimizedSelector: (state: RootState) => boolean | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.keyDriverAnalysisMinimized,
);

export const userContextSelector: (state: RootState) => IGenAIUserContext | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.userContext,
);
