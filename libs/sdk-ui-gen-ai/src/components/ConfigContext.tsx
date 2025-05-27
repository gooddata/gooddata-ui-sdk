// (C) 2024-2025 GoodData Corporation
import * as React from "react";
import { CatalogItem } from "@gooddata/sdk-model";

export type ConfigContext = {
    allowCreateVisualization: boolean;
    allowNativeLinks: boolean;
    linkHandler?: (linkClickEvent: LinkHandlerEvent) => void;
    catalogItems?: CatalogItem[];
    canManage?: boolean;
    canAnalyze?: boolean;
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
    allowCreateVisualization: false,
    allowNativeLinks: false,
});

export const ConfigProvider: React.FC<React.PropsWithChildren<ConfigContext>> = ({
    children,
    allowCreateVisualization,
    allowNativeLinks,
    linkHandler,
    catalogItems,
    canManage,
    canAnalyze,
}) => {
    const value = React.useMemo(
        () => ({
            allowCreateVisualization,
            allowNativeLinks,
            linkHandler,
            catalogItems,
            canManage,
            canAnalyze,
        }),
        [allowCreateVisualization, allowNativeLinks, linkHandler, catalogItems, canManage, canAnalyze],
    );

    return <configContext.Provider value={value}>{children}</configContext.Provider>;
};

export const useConfig = (): ConfigContext => {
    return React.useContext(configContext);
};
