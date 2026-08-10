// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import { useSelector } from "react-redux";

import { settingsSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { loadedSelector } from "../../store/messages/messagesSelectors.js";

type ThreadLoadingProps = {
    initializing?: boolean;
    loadThread: () => void;
    cancelLoading: () => void;
};

export function useThreadLoading({ initializing, cancelLoading, loadThread }: ThreadLoadingProps) {
    const loaded = useSelector(loadedSelector);
    const settings = useSelector(settingsSelector);

    useEffect(() => {
        if (initializing || loaded) {
            return () => {};
        }
        if (settings) {
            loadThread();
        }
        return () => {
            cancelLoading();
        };
    }, [loadThread, cancelLoading, initializing, loaded, settings]);
}
