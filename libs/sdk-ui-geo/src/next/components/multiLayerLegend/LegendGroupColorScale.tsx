// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import { resolveLegendGroupTitle } from "./groupTitle.js";
import { LegendGroupContainer } from "./LegendGroupContainer.js";
import { type LegendMessageFormatter } from "./legendMessages.js";
import {
    type ILegendColorScaleItem,
    type ILegendGroup,
    isLegendColorScaleItem,
} from "../../types/legend/model.js";

/**
 * Props for LegendGroupColorScale component.
 *
 * @internal
 */
export interface ILegendGroupColorScaleProps {
    /**
     * Legend group with color scale item.
     */
    group: ILegendGroup;

    /**
     * Enables enhanced a11y semantics for the color scale group.
     */
    enableGeoChartA11yImprovements?: boolean;

    /**
     * Optional formatter for accessibility labels/messages.
     */
    formatMessage?: LegendMessageFormatter;

    /**
     * Whether the color scale can be reached via keyboard.
     */
    isFocusable?: boolean;
}

/**
 * Renders the min-max color scale with gradient.
 */
function ColorScaleItem({
    item,
    enableGeoChartA11yImprovements,
    formatMessage,
}: {
    item: ILegendColorScaleItem;
    enableGeoChartA11yImprovements: boolean;
    formatMessage?: LegendMessageFormatter;
}): ReactElement {
    const hasCustomColors = Boolean(item.minColor) && Boolean(item.maxColor);
    const barStyle = hasCustomColors
        ? {
              background: `linear-gradient(to right, ${item.minColor}, ${item.maxColor})`,
          }
        : undefined;

    const scaleLabel =
        formatMessage?.("geochart.legend.colorScale.label", {
            min: item.minLabel,
            max: item.maxLabel,
        }) ?? `Color scale from ${item.minLabel} to ${item.maxLabel}`;

    return (
        <div className="gd-geo-multi-layer-legend__color-scale">
            <div
                className="gd-geo-multi-layer-legend__color-scale-bar"
                style={barStyle}
                role={enableGeoChartA11yImprovements ? "img" : undefined}
                aria-label={enableGeoChartA11yImprovements ? scaleLabel : undefined}
            />
            <div className="gd-geo-multi-layer-legend__color-scale-labels">
                <span
                    className="gd-geo-multi-layer-legend__color-scale-min"
                    title={enableGeoChartA11yImprovements ? undefined : item.minLabel}
                >
                    {item.minLabel}
                </span>
                <span
                    className="gd-geo-multi-layer-legend__color-scale-max"
                    title={enableGeoChartA11yImprovements ? undefined : item.maxLabel}
                >
                    {item.maxLabel}
                </span>
            </div>
        </div>
    );
}

/**
 * Legend group displaying a numeric color scale (gradient).
 *
 * @remarks
 * Renders a color gradient bar with min/max value labels.
 * Used for measure-based coloring in area layers where values
 * are mapped to a color spectrum.
 *
 * @internal
 */
export const LegendGroupColorScale = memo(function LegendGroupColorScale({
    group,
    enableGeoChartA11yImprovements = false,
    formatMessage,
    isFocusable = false,
}: ILegendGroupColorScaleProps): ReactElement {
    const scaleItem = group.items.find(isLegendColorScaleItem);
    const groupTitle = resolveLegendGroupTitle(group, formatMessage);

    if (!enableGeoChartA11yImprovements) {
        return (
            <div className="gd-geo-multi-layer-legend__group gd-geo-multi-layer-legend__group--color-scale">
                {groupTitle ? (
                    <div className="gd-geo-multi-layer-legend__group-title" title={groupTitle}>
                        {groupTitle}
                    </div>
                ) : null}
                {scaleItem ? (
                    <ColorScaleItem
                        item={scaleItem}
                        enableGeoChartA11yImprovements={enableGeoChartA11yImprovements}
                        formatMessage={formatMessage}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <LegendGroupContainer
            variantClassName="gd-geo-multi-layer-legend__group--color-scale"
            title={groupTitle}
            isFocusable={isFocusable}
            useFocusTarget
        >
            {scaleItem ? (
                <ColorScaleItem
                    item={scaleItem}
                    enableGeoChartA11yImprovements={enableGeoChartA11yImprovements}
                    formatMessage={formatMessage}
                />
            ) : null}
        </LegendGroupContainer>
    );
});
