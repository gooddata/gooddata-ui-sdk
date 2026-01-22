// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, memo } from "react";

import cx from "classnames";

import {
    type ILegendColorCategoryItem,
    type ILegendGroup,
    isLegendColorCategoryItem,
} from "../../types/legend/model.js";

/**
 * Props for LegendGroupColor component.
 *
 * @alpha
 */
export interface ILegendGroupColorProps {
    /**
     * Legend group with color category items.
     */
    group: ILegendGroup;

    /**
     * Callback when a color category item is clicked.
     * Enables toggle behavior for segment filtering.
     */
    onItemClick?: (uri: string) => void;
}

/**
 * Props for color category item component.
 */
interface IColorCategoryItemProps {
    item: ILegendColorCategoryItem;
    onClick?: (uri: string) => void;
}

/**
 * Renders a single color category item with swatch and label.
 * Supports click to toggle and visual disabled state.
 */
function ColorCategoryItem({ item, onClick }: IColorCategoryItemProps): ReactElement {
    const handleClick = () => {
        onClick?.(item.uri);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.(item.uri);
        }
    };

    const isClickable = Boolean(onClick);
    const itemClassName = cx("gd-geo-multi-layer-legend__color-item", {
        "gd-geo-multi-layer-legend__color-item--clickable": isClickable,
        "gd-geo-multi-layer-legend__color-item--disabled": !item.isVisible,
    });

    return (
        <div
            className={itemClassName}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? handleClick : undefined}
            onKeyDown={isClickable ? handleKeyDown : undefined}
            aria-pressed={isClickable ? item.isVisible : undefined}
            aria-label={`Category: ${item.label}, Color: ${item.color}${item.isVisible ? "" : " (hidden)"}`}
            data-testid={`gd-geo-legend-color-item-${item.uri}`}
        >
            <span
                className="gd-geo-multi-layer-legend__color-swatch"
                style={{ backgroundColor: item.color }}
            />
            <span className="gd-geo-multi-layer-legend__color-label" title={item.label}>
                {item.label}
            </span>
            {item.count !== undefined && (
                <span className="gd-geo-multi-layer-legend__color-count">({item.count})</span>
            )}
        </div>
    );
}

/**
 * Legend group displaying categorical color items.
 *
 * @remarks
 * Renders a list of color category items with colored swatches and labels.
 * Used for segment/category-based coloring in both pushpin and area layers.
 * Supports click-to-toggle for segment filtering.
 *
 * @alpha
 */
export const LegendGroupColor = memo(function LegendGroupColor({
    group,
    onItemClick,
}: ILegendGroupColorProps): ReactElement {
    const colorItems = group.items.filter(isLegendColorCategoryItem);

    return (
        <div className="gd-geo-multi-layer-legend__group gd-geo-multi-layer-legend__group--color">
            {group.title ? (
                <div className="gd-geo-multi-layer-legend__group-title" title={group.title}>
                    {group.title}
                </div>
            ) : null}
            <div className="gd-geo-multi-layer-legend__color-list">
                {colorItems.map((item) => (
                    <ColorCategoryItem key={item.uri} item={item} onClick={onItemClick} />
                ))}
            </div>
        </div>
    );
});
