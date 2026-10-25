// (C) 2019-2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { debounce } from "lodash-es";

/**
 * Hook that will call callback when browser window gets resized
 * @param callback - called once window gets resized
 * @param debounceTime - If specified it will debounce calls. If is 0 it will not debounce and calls will also not be deferred
 */
export const useWindowResize = (callback: () => void, debounceTime = 0) => {
    const debouncedCallback = useRef(null);
    useEffect(() => {
        debouncedCallback.current = debounceTime > 0 ? debounce(callback, debounceTime) : callback;

        window.addEventListener("resize", debouncedCallback.current);

        return () => window.removeEventListener("resize", debouncedCallback.current);
    }, [callback, debounceTime, debouncedCallback]);
};
