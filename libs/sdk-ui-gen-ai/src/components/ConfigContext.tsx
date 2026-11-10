// (C) 2024-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { type CatalogItem, type GenAIObjectType, type IDashboard, type IInsight } from "@gooddata/sdk-model";

export type ConfigContext = {
    allowNativeLinks?: boolean;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    canCreateDocument?: boolean;
    linkHandler?: (linkClickEvent: LinkHandlerEvent) => string | undefined;
    catalogItems?: CatalogItem[];
    inputPlaceholder?: string;
};

/**
 * Event passed to a link handler when the Gen AI assistant requests to open or copy a link.
 *
 * @public
 */
export type LinkHandlerEvent = {
    /**
     * Type of the linked object, or `setting` for a settings action.
     */
    type: "setting" | "report" | GenAIObjectType;
    /**
     * Identifier of the linked object or draft, or the action identifier for a settings link.
     */
    id: string;
    /**
     * Identifier of the workspace associated with the link.
     */
    workspaceId: string;
    /**
     * Whether the interaction requests opening the link in a new tab.
     */
    newTab: boolean;
    /**
     * Default URL of the linked item. May be relative to the application or absolute.
     */
    itemUrl: string;
    /**
     * Prevents the default browser action of the originating interaction, such as native link navigation.
     */
    preventDefault: () => void;
    /**
     * Local conversation ID, which remains stable when a new conversation receives its backend thread ID.
     */
    conversationId?: string;
    /**
     * Persistent backend conversation ID associated with the link, when available.
     */
    threadId?: string;
    /**
     * Settings section to open. Provided for links to AI settings.
     *  - ai - Requested open ai section in settings
     */
    section?: "ai";

    /**
     * Requested link action.
     *  - copy - Requested copy to clipboard action
     *  - open - Requested open link action
     */
    action: "copy" | "open";

    //DASHBOARD RELATED

    /**
     * Dashboard definition matching `id` and `dashboardStatus`, when included in a dashboard link event.
     */
    dashboard?: IDashboard;
    /**
     * Insights referenced by `dashboard`, using draft or persisted identifiers to match its status.
     */
    insights?: IInsight[];
    /**
     * Dashboard link's open mode (`saved` or `draft`). Conversation links always use `draft`,
     * including for already-saved dashboards.
     */
    dashboardStatus?: "saved" | "draft";

    //VISUALISATION RELATED

    /**
     * Insight definition matching `id` and `visualizationStatus`, when included in a visualization link event.
     */
    visualization?: IInsight;
    /**
     * Whether the visualization exists in metadata (`saved`) or is a generated draft that must be saved (`draft`).
     * @remarks When copilot editing already saved visualization, its still get status draft.
     */
    visualizationStatus?: "saved" | "draft";
};

/**
 * Mode of the Gen AI assistant.
 * @public
 */
export type GenAIAssistantMode = "docked" | "fullscreen";

/**
 * Display mode of the Gen AI assistant.
 * @public
 */
export type GenAIAssistantDisplayMode = "inline" | "modal";

const configContext = createContext<ConfigContext>({});

export function ConfigProvider({
    children,
    allowNativeLinks,
    linkHandler,
    catalogItems,
    canManage,
    canAnalyze,
    canFullControl,
    canCreateDocument,
    inputPlaceholder,
}: PropsWithChildren<ConfigContext>) {
    const parentConfig = useConfig();

    const value = useMemo(
        () => ({
            allowNativeLinks: allowNativeLinks ?? parentConfig.allowNativeLinks,
            linkHandler: linkHandler
                ? (event: LinkHandlerEvent) => {
                      const resultParent = parentConfig.linkHandler?.(event);
                      const resultCurrent = linkHandler?.(event);
                      return resultCurrent ?? resultParent;
                  }
                : parentConfig.linkHandler,
            catalogItems: catalogItems ?? parentConfig.catalogItems,
            canManage: canManage ?? parentConfig.canManage,
            canAnalyze: canAnalyze ?? parentConfig.canAnalyze,
            canFullControl: canFullControl ?? parentConfig.canFullControl,
            canCreateDocument: canCreateDocument ?? parentConfig.canCreateDocument,
            inputPlaceholder: inputPlaceholder ?? parentConfig.inputPlaceholder,
        }),
        [
            allowNativeLinks,
            parentConfig,
            linkHandler,
            catalogItems,
            canManage,
            canAnalyze,
            canFullControl,
            canCreateDocument,
            inputPlaceholder,
        ],
    );

    return <configContext.Provider value={value}>{children}</configContext.Provider>;
}

export const useConfig = (): ConfigContext => {
    return useContext(configContext);
};
