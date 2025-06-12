// (C) 2024-2025 GoodData Corporation
import * as React from "react";
import { CatalogItem } from "@gooddata/sdk-model";

export type ConfigContext = {
    allowNativeLinks: boolean;
    canManage: boolean;
    canAnalyze: boolean;
    linkHandler?: (linkClickEvent: LinkHandlerEvent) => void;
    catalogItems?: CatalogItem[];
};

/**
 * @public
 */
export type LinkHandlerEvent = {
    type: string;
    id: string;
    workspaceId: string;
    newTab: boolean;
    itemUrl: string;
    preventDefault: () => void;
};

const configContext = React.createContext<ConfigContext>({
    allowNativeLinks: false,
    canManage: false,
    canAnalyze: false,
});

export const ConfigProvider: React.FC<React.PropsWithChildren<ConfigContext>> = ({
    children,
    allowNativeLinks,
    linkHandler,
    catalogItems,
    canManage,
    canAnalyze,
}) => {
    const value = React.useMemo(
        () => ({
            allowNativeLinks,
            linkHandler,
            catalogItems,
            canManage,
            canAnalyze,
        }),
        [allowNativeLinks, linkHandler, catalogItems, canManage, canAnalyze],
    );

    return <configContext.Provider value={value}>{children}</configContext.Provider>;
};

export const useConfig = (): ConfigContext => {
    return React.useContext(configContext);
};
