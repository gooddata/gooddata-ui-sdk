// (C) 2025 GoodData Corporation
import { useEffect } from "react";

import { useSelector } from "react-redux";

import { type cancelAsyncAction, type loadThreadAction, loadedSelector } from "../../store/index.js";

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
