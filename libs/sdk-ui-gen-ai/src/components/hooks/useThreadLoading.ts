// (C) 2025 GoodData Corporation
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { loadedSelector, cancelAsyncAction, loadThreadAction } from "../../store/index.js";

type ThreadLoadingProps = {
    initializing?: boolean;
};

export function useThreadLoading({ initializing }: ThreadLoadingProps) {
    const loaded = useSelector(loadedSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        if (initializing || loaded) {
            return () => {};
        }

        dispatch(loadThreadAction());
        return () => {
            dispatch(cancelAsyncAction());
        };
    }, [dispatch, initializing, loaded]);
}
