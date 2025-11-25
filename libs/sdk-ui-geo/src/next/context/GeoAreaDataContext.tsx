// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useMemo } from "react";

import { IColorPalette } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { useGeoAreaProps } from "./GeoAreaPropsContext.js";
import { GeoDataContextProvider, IGeoDataContext } from "./GeoDataContext.js";
import { useInitialExecution } from "./InitialExecutionContext.js";
import { getAreaColorStrategy } from "../features/coloring/areaColorStrategy.js";
import { getAreaAvailableLegends } from "../features/data/areaTransformation.js";
import { useAreaLegendItems } from "../hooks/legend/useAreaLegendItems.js";
import { useAreaDataTransformation } from "../hooks/shared/useAreaDataTransformation.js";
import { IAreaGeoData, IAvailableLegends } from "../types/shared.js";

/**
 * Context for area geographic data and derived values.
 *
 * @remarks
 * This context provides all computed data derived from the initial execution result.
 * All values are computed once using useMemo and provided down the tree.
 * This eliminates the need for useEffect state synchronization.
 *
 * @alpha
 */
interface IGeoAreaDataContext {
    /**
     * Transformed area geographic data
     */
    geoData: IAreaGeoData | null;

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

const GeoAreaDataContext = createContext<IGeoAreaDataContext | undefined>(undefined);

const EMPTY_AVAILABLE_LEGENDS: IAvailableLegends = {
    hasCategoryLegend: false,
    hasColorLegend: false,
};

/**
 * Provider for area geographic data.
 *
 * @remarks
 * This provider computes all derived data from the initial execution result:
 * - Transforms DataView to IAreaGeoData
 * - Creates color strategy
 * - Generates legend items
 * - Determines available legends
 *
 * All computations use useMemo and happen once per data change.
 * No useEffect or state synchronization needed.
 *
 * @alpha
 */
export function GeoAreaDataProvider({ children }: { children: ReactNode }) {
    const props = useGeoAreaProps();
    const { initialDataView } = useInitialExecution();

    // Transform execution data to area geo format
    const geoData = useAreaDataTransformation(initialDataView);

    // Create color strategy (memoized to prevent infinite loops)
    const colorPalette = useMemo(
        () => props.config?.colorPalette || DefaultColorPalette,
        [props.config?.colorPalette],
    );
    const colorMapping = useMemo(() => props.config?.colorMapping || [], [props.config?.colorMapping]);
    const colorStrategy = useMemo(
        () =>
            geoData && initialDataView
                ? getAreaColorStrategy(colorPalette, colorMapping, geoData, initialDataView)
                : null,
        [colorPalette, colorMapping, geoData, initialDataView],
    );

    // Get base legend items (with colors, but always isVisible: true)
    const baseLegendItems = useAreaLegendItems(initialDataView, geoData, colorStrategy);

    // Compute available legends
    const availableLegends = useMemo(() => {
        if (!geoData) {
            return EMPTY_AVAILABLE_LEGENDS;
        }
        return getAreaAvailableLegends(baseLegendItems, geoData);
    }, [baseLegendItems, geoData]);

    const value = useMemo(
        () => ({
            geoData,
            colorStrategy,
            colorPalette,
            baseLegendItems,
            availableLegends,
        }),
        [geoData, colorStrategy, colorPalette, baseLegendItems, availableLegends],
    );

    const geoDataContextValue = useMemo<IGeoDataContext<IAreaGeoData>>(
        () => ({
            geoData,
            colorStrategy,
            colorPalette,
            baseLegendItems,
            availableLegends,
        }),
        [geoData, colorStrategy, colorPalette, baseLegendItems, availableLegends],
    );

    return (
        <GeoDataContextProvider value={geoDataContextValue}>
            <GeoAreaDataContext.Provider value={value}>{children}</GeoAreaDataContext.Provider>
        </GeoDataContextProvider>
    );
}

/**
 * Hook to access area geographic data.
 *
 * @remarks
 * Use this hook to access all computed data derived from the execution result.
 * All values are already computed and memoized.
 *
 * @returns Area geographic data context
 * @throws Error if used outside of GeoAreaDataProvider
 *
 * @alpha
 */
export function useGeoAreaData(): IGeoAreaDataContext {
    const context = useContext(GeoAreaDataContext);

    if (context === undefined) {
        throw new Error("useGeoAreaData must be used within a GeoAreaDataProvider");
    }

    return context;
}
