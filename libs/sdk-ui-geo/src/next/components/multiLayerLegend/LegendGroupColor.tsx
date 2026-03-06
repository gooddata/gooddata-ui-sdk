// (C) 2025-2026 GoodData Corporation

import {
    type FocusEventHandler,
    type KeyboardEvent,
    type KeyboardEventHandler,
    type ReactElement,
    memo,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";

import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { makeLinearKeyboardNavigation, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import {
    type ILegendColorCategoryItem,
    type ILegendGroup,
    isLegendColorCategoryItem,
} from "../../types/legend/model.js";

/**
 * Props for LegendGroupColor component.
 *
 * @internal
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

    /**
     * Enables enhanced keyboard semantics for interactive color list.
     */
    enableGeoChartA11yImprovements?: boolean;
}

interface IEnhancedColorCategoryItemProps {
    item: ILegendColorCategoryItem;
    id: string;
    isActive: boolean;
    isInteractive: boolean;
    onClick?: () => void;
}

function EnhancedColorCategoryItem({
    item,
    id,
    isActive,
    isInteractive,
    onClick,
}: IEnhancedColorCategoryItemProps): ReactElement {
    const itemClassName = cx("gd-geo-multi-layer-legend__color-item", {
        "gd-geo-multi-layer-legend__color-item--clickable": isInteractive,
        "gd-geo-multi-layer-legend__color-item--disabled": !item.isVisible,
        "gd-geo-multi-layer-legend__color-item--active": isActive,
    });

    return (
        <div
            id={id}
            className={itemClassName}
            role={isInteractive ? "option" : "listitem"}
            aria-selected={isInteractive ? item.isVisible : undefined}
            aria-label={item.label}
            onClick={isInteractive ? onClick : undefined}
            data-testid={`gd-geo-legend-color-item-${item.uri}`}
        >
            <span
                className="gd-geo-multi-layer-legend__color-swatch"
                style={{ backgroundColor: item.color }}
            />
            <span className="gd-geo-multi-layer-legend__color-label">{item.label}</span>
            {item.count !== undefined && (
                <span className="gd-geo-multi-layer-legend__color-count">({item.count})</span>
            )}
        </div>
    );
}

interface ILegacyColorCategoryItemProps {
    item: ILegendColorCategoryItem;
    onClick?: (uri: string) => void;
}

function LegacyColorCategoryItem({ item, onClick }: ILegacyColorCategoryItemProps): ReactElement {
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

function makeItemId(prefix: string, index: number): string {
    return `${prefix}-item-${index}`;
}

function resolveGroupInteractivity(group: ILegendGroup, onItemClick?: (uri: string) => void): boolean {
    return group.isInteractive ?? Boolean(onItemClick);
}

/**
 * Legend group displaying categorical color items.
 *
 * @remarks
 * Renders a list of color category items with colored swatches and labels.
 * Used for segment/category-based coloring in both pushpin and area layers.
 * Supports click-to-toggle for segment filtering.
 *
 * @internal
 */
function LegacyLegendGroupColor({
    group,
    onItemClick,
}: Pick<ILegendGroupColorProps, "group" | "onItemClick">): ReactElement {
    const colorItems = group.items.filter(isLegendColorCategoryItem);
    const isInteractive = resolveGroupInteractivity(group, onItemClick);
    const onItemClickHandler = isInteractive ? onItemClick : undefined;
    return (
        <div className="gd-geo-multi-layer-legend__group gd-geo-multi-layer-legend__group--color">
            {group.title ? (
                <div className="gd-geo-multi-layer-legend__group-title" title={group.title}>
                    {group.title}
                </div>
            ) : null}
            <div className="gd-geo-multi-layer-legend__color-list">
                {colorItems.map((item) => (
                    <LegacyColorCategoryItem key={item.uri} item={item} onClick={onItemClickHandler} />
                ))}
            </div>
        </div>
    );
}

function EnhancedLegendGroupColor({
    group,
    onItemClick,
}: Pick<ILegendGroupColorProps, "group" | "onItemClick">): ReactElement {
    const colorItems = group.items.filter(isLegendColorCategoryItem);
    const isInteractive = resolveGroupInteractivity(group, onItemClick);
    const onItemClickHandler = isInteractive ? onItemClick : undefined;
    const titleId = useId();
    const idPrefix = useIdPrefixed("geo-color-list");
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    const depsRef = useAutoupdateRef({
        activeIndex,
        onItemClickHandler,
        colorItems,
    });

    // Clamp activeIndex if items shrink
    const clampedIndex = Math.min(activeIndex, Math.max(colorItems.length - 1, 0));

    const ensureActiveItemVisible = useCallback(() => {
        if (!isInteractive) {
            return;
        }

        const listElement = listRef.current;
        if (!listElement) {
            return;
        }

        if (document.activeElement !== listElement) {
            return;
        }

        const activeItemId = makeItemId(idPrefix, clampedIndex);
        const activeItemElement = listElement.querySelector<HTMLElement>(`#${CSS.escape(activeItemId)}`);
        activeItemElement?.scrollIntoView?.({ block: "nearest" });
    }, [clampedIndex, idPrefix, isInteractive]);

    const handleKeyDown = useMemo<KeyboardEventHandler>(
        () =>
            makeLinearKeyboardNavigation({
                onFocusNext: () => {
                    setActiveIndex((prev) => (prev + 1 < depsRef.current.colorItems.length ? prev + 1 : 0));
                },
                onFocusPrevious: () => {
                    setActiveIndex((prev) =>
                        prev - 1 >= 0 ? prev - 1 : depsRef.current.colorItems.length - 1,
                    );
                },
                onFocusFirst: () => {
                    setActiveIndex(0);
                },
                onFocusLast: () => {
                    setActiveIndex(depsRef.current.colorItems.length - 1);
                },
                onSelect: () => {
                    const { onItemClickHandler, colorItems, activeIndex } = depsRef.current;
                    const activeItem = colorItems[activeIndex];
                    if (activeItem) {
                        onItemClickHandler?.(activeItem.uri);
                    }
                },
            }),
        [depsRef],
    );

    useEffect(() => {
        ensureActiveItemVisible();
    }, [ensureActiveItemVisible]);

    const handleListFocus = useCallback<FocusEventHandler<HTMLDivElement>>(() => {
        ensureActiveItemVisible();
    }, [ensureActiveItemVisible]);

    return (
        <div
            className="gd-geo-multi-layer-legend__group gd-geo-multi-layer-legend__group--color"
            role="group"
            aria-labelledby={group.title ? titleId : undefined}
        >
            {group.title ? (
                <div id={titleId} className="gd-geo-multi-layer-legend__group-title">
                    {group.title}
                </div>
            ) : null}
            <div
                ref={listRef}
                className="gd-geo-multi-layer-legend__color-list"
                role={isInteractive ? "listbox" : "list"}
                aria-label={group.title}
                aria-multiselectable={isInteractive ? true : undefined}
                aria-activedescendant={
                    isInteractive && colorItems.length > 0 ? makeItemId(idPrefix, clampedIndex) : undefined
                }
                tabIndex={isInteractive ? 0 : undefined}
                onKeyDown={isInteractive ? handleKeyDown : undefined}
                onFocus={isInteractive ? handleListFocus : undefined}
            >
                {colorItems.map((item, index) => (
                    <EnhancedColorCategoryItem
                        key={item.uri}
                        item={item}
                        id={makeItemId(idPrefix, index)}
                        isActive={isInteractive ? index === clampedIndex : false}
                        isInteractive={isInteractive}
                        onClick={() => onItemClickHandler?.(item.uri)}
                    />
                ))}
            </div>
        </div>
    );
}

export const LegendGroupColor = memo(function LegendGroupColor({
    group,
    onItemClick,
    enableGeoChartA11yImprovements = false,
}: ILegendGroupColorProps): ReactElement {
    if (!enableGeoChartA11yImprovements) {
        return <LegacyLegendGroupColor group={group} onItemClick={onItemClick} />;
    }

    return <EnhancedLegendGroupColor group={group} onItemClick={onItemClick} />;
});
