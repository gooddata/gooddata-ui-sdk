// (C) 2025 GoodData Corporation
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { cancelAsyncAction, loadThreadAction, loadedSelector } from "../../store/index.js";

type ThreadLoadingProps = {
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
    initializing?: boolean;
};

export function useThreadLoading({ cancelLoading, loadThread, initializing }: ThreadLoadingProps) {
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
