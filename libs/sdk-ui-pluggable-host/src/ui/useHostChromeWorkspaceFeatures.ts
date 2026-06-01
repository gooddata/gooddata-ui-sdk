// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IEffectiveSettings, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { getActiveInternalApplication, getWorkspaceIdFromPath } from "../loader/routing.js";

export interface IHostChromeWorkspaceFeatures {
    isWorkspaceApp: boolean;
    workspaceId: string | undefined;
    settings: IEffectiveSettings;
    canUseAiAssistant: boolean;
    canManageProject: boolean;
    canCreateVisualization: boolean;
    canAccessWorkbench: boolean;
    canFullControl: boolean;
    showSearch: boolean;
    showChat: boolean;
}

/**
 * Computes the workspace-app gate plus the matrix of permissions and settings the host
 * chrome needs to decide whether to render search, chat, etc.
 */
export function useHostChromeWorkspaceFeatures(
    resolvedApplications: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    pathname: string,
): IHostChromeWorkspaceFeatures {
    const activeApp = useMemo(
        () => getActiveInternalApplication(resolvedApplications, ctx, pathname),
        [resolvedApplications, ctx, pathname],
    );

    return useMemo<IHostChromeWorkspaceFeatures>(() => {
        const isWorkspaceApp = activeApp?.applicationScope === "workspace";
        const workspaceId = getWorkspaceIdFromPath(pathname);

        const settings = ctx.settings;
        const enableSemanticSearch = !!settings.enableSemanticSearch;
        const enableGenAIChat = !!settings.enableGenAIChat;
        const canUseAiAssistant = !!ctx.workspacePermissions?.canUseAiAssistant;
        const canManageProject = !!ctx.workspacePermissions?.canManageProject;
        const canCreateVisualization = !!ctx.workspacePermissions?.canCreateVisualization;
        const canAccessWorkbench = !!ctx.workspacePermissions?.canAccessWorkbench;
        const canFullControl = !!ctx.organizationPermissions?.canManageOrganization;

        const showSearch = isWorkspaceApp && !!workspaceId && enableSemanticSearch;
        const showChat = isWorkspaceApp && !!workspaceId && enableGenAIChat && canUseAiAssistant;

        return {
            isWorkspaceApp,
            workspaceId,
            settings,
            canUseAiAssistant,
            canManageProject,
            canCreateVisualization,
            canAccessWorkbench,
            canFullControl,
            showSearch,
            showChat,
        };
    }, [activeApp, ctx, pathname]);
}
