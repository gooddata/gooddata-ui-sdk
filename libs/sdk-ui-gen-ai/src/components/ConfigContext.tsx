// (C) 2024-2025 GoodData Corporation
import * as React from "react";

import { CatalogItem } from "@gooddata/sdk-model";

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
    type: "visualization" | "setting";
    id: string;
    workspaceId: string;
    newTab: boolean;
    itemUrl: string;
    preventDefault: () => void;
    section?: "ai";
};

const configContext = React.createContext<ConfigContext>({
    allowNativeLinks: false,
    canManage: false,
    canAnalyze: false,
    canFullControl: false,
});

export const ConfigProvider: React.FC<React.PropsWithChildren<ConfigContext>> = ({
    children,
    allowNativeLinks,
    linkHandler,
    catalogItems,
    canManage,
    canAnalyze,
    canFullControl,
}) => {
    const value = React.useMemo(
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
};

export const useConfig = (): ConfigContext => {
    return React.useContext(configContext);
};
