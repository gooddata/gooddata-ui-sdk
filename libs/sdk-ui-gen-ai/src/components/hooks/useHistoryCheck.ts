// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { isHistorySelector } from "../../store/chatWindow/chatWindowSelectors.js";

export function useHistoryCheck() {
    const isHistory = useSelector(isHistorySelector);

    return {
        isHistory,
    };
}
