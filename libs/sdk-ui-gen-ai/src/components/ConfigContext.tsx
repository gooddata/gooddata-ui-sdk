// (C) 2024-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { type CatalogItem, type GenAIObjectType } from "@gooddata/sdk-model";

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
};

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
            linkHandler: linkHandler ?? parentConfig.linkHandler,
            catalogItems: catalogItems ?? parentConfig.catalogItems,
            canManage: canManage ?? parentConfig.canManage,
            canAnalyze: canAnalyze ?? parentConfig.canAnalyze,
            canFullControl: canFullControl ?? parentConfig.canFullControl,
        }),
        [
            allowNativeLinks,
            parentConfig.allowNativeLinks,
            parentConfig.linkHandler,
            parentConfig.catalogItems,
            parentConfig.canManage,
            parentConfig.canAnalyze,
            parentConfig.canFullControl,
            linkHandler,
            catalogItems,
            canManage,
            canAnalyze,
            canFullControl,
        ],
    );

    return <configContext.Provider value={value}>{children}</configContext.Provider>;
}

export const useConfig = (): ConfigContext => {
    return useContext(configContext);
};
