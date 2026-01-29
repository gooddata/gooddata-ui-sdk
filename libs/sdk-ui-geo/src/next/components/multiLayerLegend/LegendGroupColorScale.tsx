// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

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
}

/**
 * Renders the min-max color scale with gradient.
 */
function ColorScaleItem({ item }: { item: ILegendColorScaleItem }): ReactElement {
    const hasCustomColors = Boolean(item.minColor) && Boolean(item.maxColor);
    const barStyle = hasCustomColors
        ? {
              background: `linear-gradient(to right, ${item.minColor}, ${item.maxColor})`,
          }
        : undefined;

    return (
        <div className="gd-geo-multi-layer-legend__color-scale">
            <div className="gd-geo-multi-layer-legend__color-scale-bar" style={barStyle} />
            <div className="gd-geo-multi-layer-legend__color-scale-labels">
                <span className="gd-geo-multi-layer-legend__color-scale-min" title={item.minLabel}>
                    {item.minLabel}
                </span>
                <span className="gd-geo-multi-layer-legend__color-scale-max" title={item.maxLabel}>
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
}: ILegendGroupColorScaleProps): ReactElement {
    const scaleItem = group.items.find(isLegendColorScaleItem);

    return (
        <div className="gd-geo-multi-layer-legend__group gd-geo-multi-layer-legend__group--color-scale">
            {group.title ? (
                <div className="gd-geo-multi-layer-legend__group-title" title={group.title}>
                    {group.title}
                </div>
            ) : null}
            {scaleItem ? <ColorScaleItem item={scaleItem} /> : null}
        </div>
    );
});
