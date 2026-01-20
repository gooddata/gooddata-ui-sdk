// (C) 2025-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type AttributeDisplayFormType, type IColorPalette } from "@gooddata/sdk-model";
import { type IAvailableDrillTargets, type IPushData, getMultiLayerDrillTargets } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoLayers } from "../../context/GeoLayersContext.js";
import { useInitialExecution } from "../../context/InitialExecutionContext.js";
import { normalizeAttributeDescriptorLocalIdentifier } from "../../layers/common/drillUtils.js";
import { type IAvailableLegends } from "../../types/common/legends.js";
import { type GeoLayerType } from "../../types/layers/index.js";

interface ILegendContext {
    availableLegends: IAvailableLegends;
}

/**
 * Minimal props interface required for pushData functionality
 *
 * @internal
 */
interface IPushDataProps {
    pushData?: (data: IPushData) => void;
}

interface IUseGeoPushDataConfig<TProps extends IPushDataProps, TLegendContext extends ILegendContext> {
    useProps: () => TProps;
    useLegendContext: () => TLegendContext;
    getLegendVisibility?: (availableLegends: IAvailableLegends) => boolean;
    geoLayerType: GeoLayerType;
}

const defaultLegendVisibility = (availableLegends: IAvailableLegends): boolean => {
    const hasSizeLegend = availableLegends.hasSizeLegend ?? false;
    return Boolean(availableLegends.hasCategoryLegend || availableLegends.hasColorLegend || hasSizeLegend);
};

/**
 * Maps geo layer type to the preferred display form type for drill-down targets.
 */
function getGeoDisplayFormType(geoLayerType: GeoLayerType): AttributeDisplayFormType | undefined {
    return geoLayerType === "area" ? "GDC.geo.area" : undefined;
}

/**
 * Enhances drill targets with geo-specific display form type preference.
 */
function enhanceDrillTargetsWithGeoDisplayForm(
    drillTargets: IAvailableDrillTargets | undefined,
    geoLayerType: GeoLayerType,
): IAvailableDrillTargets | undefined {
    if (!drillTargets) {
        return undefined;
    }

    const drillTargetDisplayFormType = getGeoDisplayFormType(geoLayerType);

    return {
        ...drillTargets,
        attributes: drillTargets.attributes?.map((attr) => ({
            ...attr,
            drillTargetDisplayFormType,
        })),
    };
}

/**
 * Shared implementation for Analytical Designer pushData updates.
 *
 * @internal
 */
export function useGeoPushData<TProps extends IPushDataProps, TLegendContext extends ILegendContext>(
    colorStrategy: IColorStrategy | null,
    colorPalette: IColorPalette,
    {
        useProps,
        useLegendContext,
        getLegendVisibility,
        geoLayerType,
    }: IUseGeoPushDataConfig<TProps, TLegendContext>,
): void {
    const props = useProps();
    const { availableLegends } = useLegendContext();
    const { initialDataView } = useInitialExecution();
    const { layers } = useGeoLayers();
    const { pushData } = props;
    const legendVisibilitySelector = getLegendVisibility ?? defaultLegendVisibility;

    const isLegendVisible = legendVisibilitySelector(availableLegends);

    // Build drill targets from all layers (combines measures from all layers)
    const layerDataViews = Array.from(layers.values()).map((l) => l.dataView);
    const fingerprintsKey = layerDataViews.map((dv) => dv?.fingerprint() ?? "null").join("|");

    // Use fingerprints key as dependency
    // We can't use layers as dependency because they are not stable across renders resulting in infinite loop
    const availableDrillTargets = useMemo(() => {
        const baseDrillTargets = getMultiLayerDrillTargets(layerDataViews, initialDataView);
        if (!baseDrillTargets) {
            return undefined;
        }

        const normalizedAttributes =
            baseDrillTargets.attributes?.map((attributeTarget) => ({
                ...attributeTarget,
                attribute: normalizeAttributeDescriptorLocalIdentifier(attributeTarget.attribute),
                intersectionAttributes: attributeTarget.intersectionAttributes.map(
                    normalizeAttributeDescriptorLocalIdentifier,
                ),
            })) ?? [];

        const normalizedDrillTargets = {
            ...baseDrillTargets,
            attributes: normalizedAttributes,
        };

        // Enhance drill targets with geo-specific display form preference
        return enhanceDrillTargetsWithGeoDisplayForm(normalizedDrillTargets, geoLayerType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fingerprintsKey, initialDataView, geoLayerType]);

    useEffect(() => {
        if (!pushData || !colorStrategy) {
            return;
        }

        pushData({
            dataView: initialDataView?.dataView,
            availableDrillTargets,
            propertiesMeta: {
                legend_enabled: isLegendVisible,
            },
            colors: {
                colorAssignments: colorStrategy.getColorAssignment(),
                colorPalette,
            },
        });
    }, [pushData, colorStrategy, colorPalette, initialDataView, isLegendVisible, availableDrillTargets]);
}
