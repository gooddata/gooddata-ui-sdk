// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext } from "react";

import { IColorPalette } from "@gooddata/sdk-model";
import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { IAvailableLegends, type IGeoCommonData } from "../types/shared.js";

/**
 * Context for geographic data and derived values.
 *
 * @remarks
 * This context provides all computed data derived from the initial execution result.
 * All values are computed once using useMemo and provided down the tree.
 * This eliminates the need for useEffect state synchronization.
 *
 * @alpha
 */
export interface IGeoDataContext<TGeoData extends IGeoCommonData = IGeoCommonData> {
    /**
     * Transformed geographic data
     */
    geoData: TGeoData | null;

    /**
     * Color strategy used for visualization
     */
    colorStrategy: IColorStrategy | null;

    /**
     * Color palette used for visualization
     */
    colorPalette: IColorPalette;

    /**
     * Base category legend items (before applying visibility state)
     */
    baseLegendItems: IPushpinCategoryLegendItem[];

    /**
     * Available legend types based on data
     */
    availableLegends: IAvailableLegends;
}

const GeoDataContext = createContext<IGeoDataContext | undefined>(undefined);

interface IGeoDataContextProviderProps {
    children: ReactNode;
    value: IGeoDataContext;
}

/**
 * @remarks
 * Use specialized providers (for example pushpin or area charts) to compute the value
 * and pass it through this wrapper so that all consumers can rely on {@link useGeoData}.
 *
 * @internal
 */
export function GeoDataContextProvider({ children, value }: IGeoDataContextProviderProps) {
    return <GeoDataContext.Provider value={value}>{children}</GeoDataContext.Provider>;
}

/**
 * Hook to access geographic data.
 *
 * @remarks
 * Use this hook to access all computed data derived from the execution result.
 * All values are already computed and memoized.
 *
 * @returns Geographic data context
 * @throws Error if used outside of GeoDataContextProvider
 *
 * @alpha
 */
export function useGeoData<TGeoData extends IGeoCommonData = IGeoCommonData>(): IGeoDataContext<TGeoData> {
    const context = useContext(GeoDataContext);

    if (context === undefined) {
        throw new Error("useGeoData must be used within a GeoDataContextProvider");
    }

    return context as IGeoDataContext<TGeoData>;
}
