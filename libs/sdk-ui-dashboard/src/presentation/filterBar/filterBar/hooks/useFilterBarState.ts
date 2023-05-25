// (C) 2021-2022 GoodData Corporation

import { useState, useEffect } from "react";
import { CalculatedRows, CalculatedRowsDefault } from "./useRowsCalculator.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
    selectFilterBarExpanded,
    uiActions,
} from "../../../../model/index.js";

//NOTE: This 1px is size of border bottom on filter bar
const BorderWidth = 1;
//NOTE: This must be same value as $transition-length
const TransitionLength = 200;

export function useFilterBarState() {
    const [calculatedRows, setCalculatedRows] = useState<CalculatedRows>(CalculatedRowsDefault);
    const { expandedHeight, collapsedHeight, rows } = calculatedRows;

    const dispatch = useDashboardDispatch();
    const isFilterBarExpanded = useDashboardSelector(selectFilterBarExpanded);

    const scrollable = useScrollable(isFilterBarExpanded);

    const setFilterBarExpanded = (isExpanded: boolean) =>
        dispatch(uiActions.setFilterBarExpanded(isExpanded));

    const innerHeight = isFilterBarExpanded ? expandedHeight : collapsedHeight;

    return {
        rows,
        scrollable,
        height: innerHeight + BorderWidth,
        isFilterBarExpanded,
        setCalculatedRows,
        setFilterBarExpanded,
    };
}

function useScrollable(expanded: boolean) {
    const [scrollable, setScrollable] = useState(false);

    useEffect(() => {
        let timer: number | null = null;
        if (expanded) {
            timer = window.setTimeout(() => setScrollable(true), TransitionLength);
        } else {
            setScrollable(false);
        }
        return () => {
            if (timer !== null) {
                window.clearTimeout(timer);
            }
        };
    }, [expanded]);

    return scrollable;
}
