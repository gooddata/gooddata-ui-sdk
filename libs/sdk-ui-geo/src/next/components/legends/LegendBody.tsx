// (C) 2025 GoodData Corporation

import { type ReactElement } from "react";

import { type ContentRect } from "react-measure";

import { type ITranslationsComponentProps, IntlTranslationsProvider } from "@gooddata/sdk-ui";

import { adaptLegendPropsToOldRenderer } from "./legendPropsAdapter.js";
import { type ILegendBodyProps } from "./types.js";
import { GeoChartLegendRenderer } from "../../../core/geoChart/GeoChartLegendRenderer.js";

/**
 * Responsible for rendering the legend using the proven GeoChartLegendRenderer
 * from the old implementation. This component acts as an adapter between the new
 * chart's context architecture and the old legend renderer.
 *
 * The component wraps GeoChartLegendRenderer with IntlTranslationsProvider to
 * provide numericSymbols required for number formatting in legends.
 */
export function LegendBody(props: ILegendBodyProps): ReactElement {
    const { legendWidth, legendHeight } = props;

    // Create ContentRect for the old renderer (it expects react-measure format)
    const contentRect: ContentRect = {
        client: {
            width: legendWidth,
            height: legendHeight,
            top: 0,
            left: 0,
        },
    };

    // Adapt new props format to old renderer props format
    const oldRendererProps = adaptLegendPropsToOldRenderer(props, contentRect);

    // Wrap with IntlTranslationsProvider to provide numericSymbols
    // (same pattern as old implementation in GeoChartInner.tsx)
    return (
        <IntlTranslationsProvider>
            {(translationProps: ITranslationsComponentProps) => (
                <GeoChartLegendRenderer
                    {...oldRendererProps}
                    numericSymbols={translationProps.numericSymbols}
                />
            )}
        </IntlTranslationsProvider>
    );
}
