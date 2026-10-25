// (C) 2007-2026 GoodData Corporation

import { type ReactElement, type Ref, memo, useCallback, useEffect, useState } from "react";

import { useDrag } from "@evil-internetmann/react-dnd";
import classNames from "classnames";
import { useDispatch } from "react-redux";

import { BUCKET_ITEM, FILTER_ITEM } from "../../constants/drag_item_types.js";
import { storeFilterBarAutoOpen } from "../../store/filter_bar/filter_bar_actions.js";
import { FilterBar, type IFilterBarItem } from "../../store/filter_bar/filter_bar_types.js";
import { isParameterFilter } from "../../store/filter_bar/parameter_filter_types.js";
import { type AppDispatch } from "../../store/types.js";
import { type IDragFilterItem } from "../../typings/drag_and_drop.js";

import { AttributeFilterItemPure as AttributeFilterItem } from "./AttributeFilterItem.js";
import { DateFilterItem } from "./dateFilter/DateFilterItem.js";
import { FilterItemDragLayer } from "./FilterItemDragLayer.js";
import { MeasureValueFilterItem } from "./MeasureValueFilterItem.js";
import { ParameterFilterItem } from "./parameterFilter/ParameterFilterItem.js";
import { RankingFilterItem } from "./rankingFilter/RankingFilterItem.js";

interface IDragSourceProps {
    isDragging?: boolean;
}

interface IDraggableFilterItemOwnProps {
    filterItem: IFilterBarItem;
    isHighlighted: boolean;
    /** the store's auto-open hand-over names this filter: its picker opens right away */
    isAutoOpen?: boolean;
    onStartFilterItemDrag: (filter: IFilterBarItem) => void;
    onEndFilterItemDrag: () => void;
}

export type IDraggableFilterItemProps = IDraggableFilterItemOwnProps & IDragSourceProps;

export const DraggableFilterItem = memo(function DraggableFilterItem({
    filterItem,
    isHighlighted,
    isAutoOpen = false,
    isDragging: isDraggingProp,
    onStartFilterItemDrag,
    onEndFilterItemDrag,
}: IDraggableFilterItemProps) {
    const [hover, setHover] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    // The store keeps the hand-over until THIS picker closes, so a picker the user closed stays closed.
    // Only the current owner clears it: a newer add has already taken it over, and that one is still
    // waiting to open.
    const onPickerClose = useCallback(() => {
        if (isAutoOpen) {
            dispatch(storeFilterBarAutoOpen(null));
        }
    }, [isAutoOpen, dispatch]);

    useEffect(() => {
        if (isDraggingProp) {
            // not hovering anymore, but browser thinks it is
            // prove him wrong!
            setHover(false);
        }
    }, [isDraggingProp]);

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: BUCKET_ITEM,
            item: () => {
                function renderDraggedItemElement(): ReactElement {
                    return <FilterItemDragLayer filter={filterItem} />;
                }
                onStartFilterItemDrag(filterItem);
                return {
                    dragItemType: FILTER_ITEM,
                    itemType: filterItem.type,
                    itemLocalIdentifier: filterItem.localIdentifier,
                    renderDraggedItemElement,
                } as IDragFilterItem;
            },
            end: () => {
                onEndFilterItemDrag();
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [filterItem, onStartFilterItemDrag, onEndFilterItemDrag],
    );

    const renderFilterComponent = () => {
        const classes = classNames({
            "adi-filter-button-hover": hover,
            "is-dragging": isDragging,
        });

        if (FilterBar.isDateFilter(filterItem)) {
            return (
                <DateFilterItem
                    filter={filterItem}
                    className={classes}
                    isHighlighted={isHighlighted}
                    isAutoOpen={isAutoOpen}
                    onClose={onPickerClose}
                />
            );
        } else if (FilterBar.isAttributeFilter(filterItem)) {
            return (
                <AttributeFilterItem
                    filterLocalIdentifier={filterItem.localIdentifier}
                    isHighlighted={isHighlighted}
                    isAutoOpen={isAutoOpen}
                    onClose={onPickerClose}
                />
            );
        } else if (FilterBar.isMeasureValueFilter(filterItem)) {
            return (
                <MeasureValueFilterItem
                    filter={filterItem}
                    className={classes}
                    isHighlighted={isHighlighted}
                    isAutoOpen={isAutoOpen}
                    onClose={onPickerClose}
                />
            );
        } else if (FilterBar.isRankingFilter(filterItem)) {
            return (
                <RankingFilterItem
                    filter={filterItem}
                    className={classes}
                    isHighlighted={isHighlighted}
                    isAutoOpen={isAutoOpen}
                    onClose={onPickerClose}
                />
            );
        } else if (isParameterFilter(filterItem)) {
            return (
                <ParameterFilterItem filter={filterItem} className={classes} isHighlighted={isHighlighted} />
            );
        }

        return null;
    };

    const onMouseOver = () => {
        setHover(true);
    };

    const onMouseOut = () => {
        setHover(false);
    };

    return (
        <li ref={dragRef as unknown as Ref<HTMLLIElement>} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
            {renderFilterComponent()}
        </li>
    );
});

export const DraggableFilterItemTest = {
    DraggableFilterItem,
};
