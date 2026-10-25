// (C) 2019-2026 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";

import { setMultilineFilterBar } from "../../sagas/filter_bar/filter_bar_ui_actions.js";
import {
    getFilterItemsWithoutAdditionalDateAttributes,
    getParameterFilters,
    isMultiline as isMultilineSelector,
} from "../../store/filter_bar/filter_bar_selector.js";
import { type AppDispatch } from "../../store/types.js";
import { useWindowResize } from "../../utils/hooks/WindowResizeHook.js";

import { FilterBarHeader } from "./FilterBarHeader.js";
import { FilterBarList } from "./FilterBarList.js";

const RESIZE_EVENT_DEBOUNCE_MILLISECONDS = 120;

const isElementMultiline = (element: HTMLElement) => {
    if (!element) {
        return false;
    }

    const style = window.getComputedStyle(element);
    const minHeight = parseInt(style.getPropertyValue("min-height"), 10);
    const currentHeight = parseInt(style.getPropertyValue("height"), 10);

    return currentHeight > minHeight;
};

export function FilterBar({ isSmallScreen }: { isSmallScreen?: boolean }) {
    const filterItems = useSelector(getFilterItemsWithoutAdditionalDateAttributes);
    const parameterItems = useSelector(getParameterFilters);
    const isMultiline = useSelector(isMultilineSelector) ?? false;

    const dispatch = useDispatch<AppDispatch>();
    const setMultiline = useCallback(
        (multilineValue: boolean) => dispatch(setMultilineFilterBar(multilineValue)),
        [dispatch],
    );

    const wrapperElement = useRef(null);

    const checkMultiline = useCallback(() => {
        if (isElementMultiline(wrapperElement.current) !== isMultiline) {
            setMultiline(!isMultiline);
        }
    }, [isMultiline, setMultiline, wrapperElement]);

    useEffect(checkMultiline, [filterItems, parameterItems, checkMultiline]);
    useWindowResize(checkMultiline, RESIZE_EVENT_DEBOUNCE_MILLISECONDS);

    const isEmpty = filterItems.length + parameterItems.length === 0;

    return (
        <div
            className={classNames("adi-bucket", "adi-filter-bucket", "s-bucket-filters", {
                "s-bucket-empty": isEmpty,
                "s-bucket-not-empty": !isEmpty,
            })}
            ref={wrapperElement}
        >
            <FilterBarHeader />
            <FilterBarList
                filterItems={filterItems}
                parameterItems={parameterItems}
                isSmallScreen={isSmallScreen}
            />
        </div>
    );
}
