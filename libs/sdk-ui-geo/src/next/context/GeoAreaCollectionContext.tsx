// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useMemo } from "react";

import { useGeoAreaProps } from "./GeoAreaPropsContext.js";
import { useInitialExecution } from "./InitialExecutionContext.js";
import {
    IAreaCollectionFeatures,
    useAreaCollectionFeatures,
} from "../hooks/shared/useAreaCollectionFeatures.js";

const GeoAreaCollectionContext = createContext<IAreaCollectionFeatures | undefined>(undefined);

/**
 * Provides geo collection metadata and features for GeoArea charts.
 *
 * @remarks
 * The provider resolves geo collections using the initial execution result and
 * exposes the resulting features/bounding box via context for reuse across the
 * rendering tree.
 *
 * @alpha
 */
export function GeoAreaCollectionProvider({ children }: { children: ReactNode }) {
    const props = useGeoAreaProps();
    const { initialDataView } = useInitialExecution();
    const collection = useAreaCollectionFeatures(initialDataView, props.area, props.backend, props.workspace);
    const value = useMemo(() => collection, [collection]);

    return <GeoAreaCollectionContext.Provider value={value}>{children}</GeoAreaCollectionContext.Provider>;
}

/**
 * Hook to access geo collection data.
 *
 * @returns Collection features and metadata
 *
 * @alpha
 */
export function useGeoAreaCollection(): IAreaCollectionFeatures {
    const context = useContext(GeoAreaCollectionContext);

    if (!context) {
        throw new Error("useGeoAreaCollection must be used within a GeoAreaCollectionProvider");
    }

    return context;
}
