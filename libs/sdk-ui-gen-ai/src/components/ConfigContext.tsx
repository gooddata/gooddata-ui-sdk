// (C) 2024-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { type CatalogItem, type GenAIObjectType, type IDashboard, type IInsight } from "@gooddata/sdk-model";

export type ConfigContext = {
    allowNativeLinks?: boolean;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    linkHandler?: (linkClickEvent: LinkHandlerEvent) => string | undefined;
    catalogItems?: CatalogItem[];
};

/**
 * @public
 */
export type LinkHandlerEvent = {
    type: "setting" | GenAIObjectType;
    id: string;
    workspaceId: string;
    newTab: boolean;
    itemUrl: string;
    preventDefault: () => void;
    section?: "ai";
    dashboard?: IDashboard;
    insights?: IInsight[];
    dashboardStatus?: "saved" | "draft";
    visualization?: IInsight;
    visualizationStatus?: "saved" | "draft";
    action: "copy" | "open";
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
        }),
        [allowNativeLinks, parentConfig, linkHandler, catalogItems, canManage, canAnalyze, canFullControl],
    );

    return <configContext.Provider value={value}>{children}</configContext.Provider>;
}

export const useConfig = (): ConfigContext => {
    return useContext(configContext);
};
