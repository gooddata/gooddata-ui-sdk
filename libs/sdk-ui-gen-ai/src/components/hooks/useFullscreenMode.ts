// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { useDispatch, useSelector, useStore } from "react-redux";

import { isFullscreenSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { setFullscreenAction } from "../../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../../store/types.js";

/**
 * Display mode of the Gen AI assistant.
 * @public
 */
export type GenAIAssistantMode = "docked" | "fullscreen";

const toMode = (isFullscreen: boolean): GenAIAssistantMode => (isFullscreen ? "fullscreen" : "docked");

/**
 * Keeps the `mode` and `onModeChange` props in sync with the fullscreen flag in the chat window store.
 * @internal
 */
export function useFullscreenMode(
    mode?: GenAIAssistantMode,
    onModeChange?: (mode: GenAIAssistantMode) => void,
): void {
    const dispatch = useDispatch();
    const store = useStore<RootState>();
    const storeMode = toMode(useSelector(isFullscreenSelector));

    useEffect(() => {
        if (mode === undefined) {
            return;
        }

        const isFullscreen = mode === "fullscreen";
        if (isFullscreenSelector(store.getState()) === isFullscreen) {
            return;
        }

        dispatch(setFullscreenAction({ isFullscreen }));
    }, [mode, dispatch, store]);

    const onModeChangeRef = useRef(onModeChange);
    onModeChangeRef.current = onModeChange;

    const reportedModeRef = useRef(storeMode);
    useEffect(() => {
        if (reportedModeRef.current === storeMode) {
            return;
        }
        reportedModeRef.current = storeMode;

        if (mode === storeMode) {
            return;
        }

        onModeChangeRef.current?.(storeMode);
    }, [storeMode, mode]);
}
