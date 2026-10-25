// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import { endDragFilterItem, startDragFilterItem } from "../../sagas/drag_and_drop/drag_and_drop_actions.js";
import { getFilterBarAutoOpenFilter } from "../../selectors/filter_bar_auto_open_selector.js";
import { type IFilter, type IFilterBarItem } from "../../store/filter_bar/filter_bar_types.js";
import { type IParameterFilter } from "../../store/filter_bar/parameter_filter_types.js";
import { getHighlightedFilterItem } from "../../store/highlighting/highlighting_selector.js";
import { type AppDispatch } from "../../store/types.js";

import { DraggableFilterItem } from "./DraggableFilterItem.js";
import { FilterBarDropdown } from "./filterBarDropdown/FilterBarDropdown.js";
import { PureFilterBarDropTarget as FilterBarDropTarget } from "./filterBarDropTarget/FilterBarDropTarget.js";

interface IFilterBarListStateProps {
    highlightedFilterLocalIdentifier: string | undefined;
}

interface IFilterBarListOwnProps {
    filterItems: ReadonlyArray<IFilter>;
    parameterItems: ReadonlyArray<IParameterFilter>;
    isSmallScreen?: boolean;
}

interface IFilterBarListDispatchProps {
    onStartFilterItemDrag: (filter: IFilterBarItem) => void;
    onEndFilterItemDrag: () => void;
}

export type IFilterBarListProps = IFilterBarListOwnProps &
    IFilterBarListStateProps &
    IFilterBarListDispatchProps;

export function FilterBarList({ filterItems, parameterItems, isSmallScreen }: IFilterBarListOwnProps) {
    const highlightedFilterLocalIdentifier = useSelector(getHighlightedFilterItem);
    const autoOpenFilterLocalIdentifier = useSelector(getFilterBarAutoOpenFilter);

    const dispatch = useDispatch<AppDispatch>();

    const onStartFilterItemDrag = useCallback(
        (filter: IFilterBarItem) => dispatch(startDragFilterItem(filter)),
        [dispatch],
    );
    const onEndFilterItemDrag = useCallback(() => dispatch(endDragFilterItem()), [dispatch]);

    return (
        <ul className="adi-filter-bucket-list">
            {[...filterItems, ...parameterItems].map((item: IFilterBarItem) => {
                const isHighlighted = item.localIdentifier === highlightedFilterLocalIdentifier;
                // the store owns the hand-over until that picker closes; a newer add overwrites it, so
                // the older item's prop turns false before its picker could open
                const isAutoOpen = item.localIdentifier === autoOpenFilterLocalIdentifier;
                return (
                    <DraggableFilterItem
                        filterItem={item}
                        key={item.localIdentifier}
                        isHighlighted={isHighlighted}
                        isAutoOpen={isAutoOpen}
                        onStartFilterItemDrag={onStartFilterItemDrag}
                        onEndFilterItemDrag={onEndFilterItemDrag}
                    />
                );
            })}
            <li>
                <div className="adi-filter-manage">
                    <FilterBarDropTarget isSmallScreen={isSmallScreen} />
                    <FilterBarDropdown />
                </div>
            </li>
        </ul>
    );
}
