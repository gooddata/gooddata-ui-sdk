// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import {
    type ILegendGroup,
    type ILegendSizeAnchorItem,
    isLegendSizeAnchorItem,
} from "../../types/legend/model.js";

/**
 * Props for LegendGroupSize component.
 *
 * @internal
 */
export interface ILegendGroupSizeProps {
    /**
     * Legend group with size anchor items.
     */
    group: ILegendGroup;
}

/**
 * Renders a single size anchor (circle) with its label.
 */
function SizeAnchorItem({ item }: { item: ILegendSizeAnchorItem }): ReactElement {
    return (
        <div className="gd-geo-multi-layer-legend__size-anchor" aria-label={`Size: ${item.label}`}>
            <span
                className="gd-geo-multi-layer-legend__size-circle"
                style={{
                    width: item.sizePx,
                    height: item.sizePx,
                }}
            />
            <span className="gd-geo-multi-layer-legend__size-label">{item.label}</span>
        </div>
    );
}

/**
 * Legend group displaying size anchors for pushpin layers.
 *
 * @remarks
 * Renders 2-3 size anchors (min, mid, max) showing how data values
 * map to marker sizes. Each anchor shows a circle of proportional
 * size and the corresponding formatted value.
 *
 * @internal
 */
export const LegendGroupSize = memo(function LegendGroupSize({ group }: ILegendGroupSizeProps): ReactElement {
    const sizeItems = group.items.filter(isLegendSizeAnchorItem);

    return (
        <div className="gd-geo-multi-layer-legend__group gd-geo-multi-layer-legend__group--size">
            {group.title ? (
                <div className="gd-geo-multi-layer-legend__group-title" title={group.title}>
                    {group.title}
                </div>
            ) : null}
            <div className="gd-geo-multi-layer-legend__size-list">
                {sizeItems.map((item, index) => (
                    <SizeAnchorItem key={index} item={item} />
                ))}
            </div>
        </div>
    );
});
