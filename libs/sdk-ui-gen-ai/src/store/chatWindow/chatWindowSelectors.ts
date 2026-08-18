// (C) 2024-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type GenAIObjectType,
    type IAllowedRelationshipType,
    type IColorPalette,
    type IGenAIUserContext,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import type { IKdaDefinition } from "@gooddata/sdk-ui-dashboard";

import { type ContextDashboardsState } from "../../types.js";
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

export const contextSetupEnabledSelector: (state: RootState) => boolean = createSelector(
    settingsSelector,
    (settings) => settings?.enableAiContextSetup === true,
);

export const reasoningEffortEnabledSelector: (state: RootState) => boolean = createSelector(
    settingsSelector,
    (settings) => settings?.["enableGenAiReasoningEffort"] === true,
);

// Whether the agent switcher is usable in the current chat context. It is never usable in preview
// mode: the assistant is pinned to the single preview agent being built, so the switcher stays
// hidden and the legacy input is used.
export const agentSwitchingActiveSelector: (state: RootState) => boolean = createSelector(
    agentSwitchingEnabledSelector,
    isPreviewSelector,
    (agentSwitchingEnabled, isPreview) => agentSwitchingEnabled && !isPreview,
);

export const allowInteractionIntelligenceSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.allowInteractionIntelligence === true,
);

// Whether the Interaction Intelligence panel is enabled in the current chat context.
// Requires both the plug-in instance to allow it (agent builder passes `allowInteractionIntelligence`)
// and the workspace-level feature flag to be on.
export const interactionIntelligenceEnabledSelector: (state: RootState) => boolean = createSelector(
    allowInteractionIntelligenceSelector,
    settingsSelector,
    (allowInteractionIntelligence, settings) =>
        allowInteractionIntelligence && settings?.["enableGenAiInteractionIntelligence"] === true,
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

export const contextDashboardsSelector: (state: RootState) => ContextDashboardsState = createSelector(
    chatWindowSliceSelector,
    (state) => state.contextDashboards,
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
    (state) => state.context.active,
);

export const ambientContextSelector: (state: RootState) => IGenAIUserContext | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.context.ambient,
);

export const hasPinnedContextSelector: (state: RootState) => boolean = createSelector(
    userContextSelector,
    ambientContextSelector,
    (active, ambient) => {
        if (!active) {
            return false;
        }
        if (active.referencedObjects?.length || active.activeObject) {
            return true;
        }

        const dashboardRef = active.view?.dashboard?.ref;

        return Boolean(dashboardRef) && !areObjRefsEqual(dashboardRef, ambient?.view?.dashboard?.ref);
    },
);
