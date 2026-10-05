// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { settingsSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { loadDataAction } from "../../store/chatWindow/chatWindowSlice.js";

export function useDataLoad() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

    useEffect(() => {
        if (settings) {
            dispatch(loadDataAction());
        }
    }, [dispatch, settings]);
}
