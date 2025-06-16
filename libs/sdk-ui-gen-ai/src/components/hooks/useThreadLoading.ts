// (C) 2025 GoodData Corporation
import { useEffect } from "react";
import { cancelAsyncAction, loadThreadAction } from "../../store/index.js";

type ThreadLoadingProps = {
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
    initializing?: boolean;
};

export function useThreadLoading({ cancelLoading, loadThread, initializing }: ThreadLoadingProps) {
    useEffect(() => {
        if (initializing) {
            return;
        }
        loadThread();

        return () => {
            cancelLoading();
        };
    }, [loadThread, cancelLoading, initializing]);
}
