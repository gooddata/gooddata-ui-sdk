// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import { useSelector } from "react-redux";

import { loadedSelector } from "../../store/messages/messagesSelectors.js";
import { type cancelAsyncAction, type loadThreadAction } from "../../store/messages/messagesSlice.js";

type ThreadLoadingProps = {
    initializing?: boolean;
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
};

export function useThreadLoading({ initializing, cancelLoading, loadThread }: ThreadLoadingProps) {
    const loaded = useSelector(loadedSelector);

    useEffect(() => {
        if (initializing || loaded) {
            return () => {};
        }

        loadThread();
        return () => {
            cancelLoading();
        };
    }, [loadThread, cancelLoading, initializing, loaded]);
}
