// (C) 2025 GoodData Corporation

import { ReactElement, ReactNode, createContext, useContext } from "react";

import type { IMapFacade, IPopupFacade } from "../layers/common/mapFacade.js";
import type { IGeoAdapterContext } from "../layers/registry/adapterTypes.js";

export interface IMapRuntimeContextValue {
    map: IMapFacade | null;
    tooltip: IPopupFacade | null;
    isMapReady: boolean;
    adapterContext: IGeoAdapterContext;
}

const MapRuntimeContext = createContext<IMapRuntimeContextValue | null>(null);

export function MapRuntimeProvider({
    value,
    children,
}: {
    value: IMapRuntimeContextValue;
    children: ReactNode;
}): ReactElement {
    return <MapRuntimeContext.Provider value={value}>{children}</MapRuntimeContext.Provider>;
}

export function useMapRuntime(): IMapRuntimeContextValue {
    const context = useContext(MapRuntimeContext);
    if (!context) {
        throw new Error("useMapRuntime must be used within MapRuntimeProvider");
    }

    return context;
}
