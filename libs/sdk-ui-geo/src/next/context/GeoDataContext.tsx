// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useMemo } from "react";

import { IColorPalette } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { useGeoPushpinProps } from "./GeoPushpinPropsContext.js";
import { useInitialExecution } from "./InitialExecutionContext.js";
import { getColorStrategy } from "../features/coloring/colorStrategy.js";
import { getAvailableLegends } from "../features/data/transformation.js";
import { useLegendItems } from "../hooks/legend/useLegendItems.js";
import { useGeoDataTransformation } from "../hooks/shared/useGeoDataTransformation.js";
import { IAvailableLegends, IGeoData } from "../types/shared.js";

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
interface IGeoDataContext {
    /**
     * Transformed geographic data
     */
    geoData: IGeoData | null;

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

const EMPTY_AVAILABLE_LEGENDS: IAvailableLegends = {
    hasCategoryLegend: false,
    hasColorLegend: false,
    hasSizeLegend: false,
};

/**
 * Provider for geographic data.
 *
 * @remarks
 * This provider computes all derived data from the initial execution result:
 * - Transforms DataView to IGeoData
 * - Creates color strategy
 * - Generates legend items
 * - Determines available legends
 *
 * All computations use useMemo and happen once per data change.
 * No useEffect or state synchronization needed.
 *
 * @alpha
 */
export function GeoDataProvider({ children }: { children: ReactNode }) {
    const props = useGeoPushpinProps();
    const { initialDataView } = useInitialExecution();

    // Transform execution data to geo format
    const geoData = useGeoDataTransformation(initialDataView);

    // Create color strategy (memoized to prevent infinite loops)
    const colorPalette = useMemo(
        () => props.config?.colorPalette || DefaultColorPalette,
        [props.config?.colorPalette],
    );
    const colorMapping = useMemo(() => props.config?.colorMapping || [], [props.config?.colorMapping]);
    const colorStrategy = useMemo(
        () =>
            geoData && initialDataView
                ? getColorStrategy(colorPalette, colorMapping, geoData, initialDataView)
                : null,
        [colorPalette, colorMapping, geoData, initialDataView],
    );

    // Get base legend items (with colors, but always isVisible: true)
    const baseLegendItems = useLegendItems(initialDataView, geoData, colorStrategy);

    // Compute available legends
    const availableLegends = useMemo(() => {
        if (!geoData) {
            return EMPTY_AVAILABLE_LEGENDS;
        }
        return getAvailableLegends(baseLegendItems, geoData);
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
 * @throws Error if used outside of GeoDataProvider
 *
 * @alpha
 */
export function useGeoData(): IGeoDataContext {
    const context = useContext(GeoDataContext);

    if (context === undefined) {
        throw new Error("useGeoData must be used within a GeoDataProvider");
    }

    return context;
}
