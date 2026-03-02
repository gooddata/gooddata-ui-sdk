// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import { LegendGroupContainer } from "./LegendGroupContainer.js";
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

    /**
     * Enables enhanced a11y semantics for the size list.
     */
    enableGeoChartA11yImprovements?: boolean;

    /**
     * Whether the size list can be reached via keyboard.
     */
    isFocusable?: boolean;
}

/**
 * Renders a single size anchor (circle) with its label.
 */
function SizeAnchorItem({ item }: { item: ILegendSizeAnchorItem }): ReactElement {
    return (
        <div className="gd-geo-multi-layer-legend__size-anchor-wrapper" role="listitem">
            <div className="gd-geo-multi-layer-legend__size-anchor">
                <span
                    className="gd-geo-multi-layer-legend__size-circle"
                    style={{
                        width: item.sizePx,
                        height: item.sizePx,
                    }}
                />
                <span className="gd-geo-multi-layer-legend__size-label">{item.label}</span>
            </div>
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
export const LegendGroupSize = memo(function LegendGroupSize({
    group,
    enableGeoChartA11yImprovements = false,
    isFocusable = false,
}: ILegendGroupSizeProps): ReactElement {
    const sizeItems = group.items.filter(isLegendSizeAnchorItem);

    if (!enableGeoChartA11yImprovements) {
        return (
            <div className="gd-geo-multi-layer-legend__group gd-geo-multi-layer-legend__group--size">
                {group.title ? (
                    <div className="gd-geo-multi-layer-legend__group-title" title={group.title}>
                        {group.title}
                    </div>
                ) : null}
                <div className="gd-geo-multi-layer-legend__size-list">
                    {sizeItems.map((item, index) => (
                        <div
                            key={index}
                            className="gd-geo-multi-layer-legend__size-anchor"
                            aria-label={`Size: ${item.label}`}
                        >
                            <span
                                className="gd-geo-multi-layer-legend__size-circle"
                                style={{
                                    width: item.sizePx,
                                    height: item.sizePx,
                                }}
                            />
                            <span className="gd-geo-multi-layer-legend__size-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <LegendGroupContainer
            variantClassName="gd-geo-multi-layer-legend__group--size"
            title={group.title}
            isFocusable={isFocusable}
            useFocusTarget
        >
            <div className="gd-geo-multi-layer-legend__size-list" role="list" aria-label={group.title}>
                {sizeItems.map((item, index) => (
                    <SizeAnchorItem key={index} item={item} />
                ))}
            </div>
        </LegendGroupContainer>
    );
});
