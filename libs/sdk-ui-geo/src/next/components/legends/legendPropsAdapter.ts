// (C) 2025 GoodData Corporation

import { ContentRect } from "react-measure";

import { IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { ILegendBodyProps } from "./types.js";
import type { IGeoChartLegendRendererProps } from "../../../core/geoChart/GeoChartLegendRenderer.js";

/**
 * Adapts props from the new GeoPushpinChartNext legend context
 * to the format expected by the old GeoChartLegendRenderer.
 *
 * This adapter allows us to reuse the proven, working legend implementation
 * from the old chart while maintaining the new chart's context architecture.
 *
 * @internal
 */
export function adaptLegendPropsToOldRenderer(
    props: ILegendBodyProps,
    contentRect: ContentRect,
): IGeoChartLegendRendererProps {
    const {
        legendDetails,
        categoryItems,
        geoData,
        colorLegendValue,
        isFluidLayout,
        responsive,
        onCategoryItemClick,
    } = props;

    // Map legend details to old renderer props
    const position = legendDetails?.position ?? "top";
    const renderPopUp = legendDetails?.renderPopUp ?? false;
    const maxRows = legendDetails?.maxRows;
    const name = legendDetails?.name;

    return {
        categoryItems,
        geoData: geoData ?? undefined,
        colorLegendValue: colorLegendValue ?? "",
        position,
        responsive,
        isFluidLegend: isFluidLayout,
        renderPopUp,
        maxRows,
        name,
        containerId: props.containerId,
        onItemClick: onCategoryItemClick as ((item: IPushpinCategoryLegendItem) => void) | undefined,
        contentRect,
        // numericSymbols will be provided by IntlTranslationsProvider wrapper
    };
}
