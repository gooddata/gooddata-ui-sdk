// (C) 2024-2025 GoodData Corporation

import { PropsWithChildren, createContext, useContext, useMemo } from "react";

import { CatalogItem, type GenAIObjectType } from "@gooddata/sdk-model";

export type ConfigContext = {
    allowNativeLinks: boolean;
    canManage: boolean;
    canAnalyze: boolean;
    canFullControl: boolean;
    linkHandler?: (linkClickEvent: LinkHandlerEvent) => void;
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

const configContext = createContext<ConfigContext>({
    allowNativeLinks: false,
    canManage: false,
    canAnalyze: false,
    canFullControl: false,
});

export function ConfigProvider({
    children,
    allowNativeLinks,
    linkHandler,
    catalogItems,
    canManage,
    canAnalyze,
    canFullControl,
}: PropsWithChildren<ConfigContext>) {
    const value = useMemo(
        () => ({
            allowNativeLinks,
            linkHandler,
            catalogItems,
            canManage,
            canAnalyze,
            canFullControl,
        }),
        [allowNativeLinks, linkHandler, catalogItems, canManage, canAnalyze, canFullControl],
    );

    return <configContext.Provider value={value}>{children}</configContext.Provider>;
}

export const useConfig = (): ConfigContext => {
    return useContext(configContext);
};
