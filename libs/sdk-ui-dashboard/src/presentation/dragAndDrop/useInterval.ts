// (C) 2022-2025 GoodData Corporation

import { useEffect, useLayoutEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useLayoutEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!delay && delay !== 0) {
            return;
        }

        const id = setInterval(() => savedCallback.current(), delay);

        return () => clearInterval(id);
    }, [delay]);
}
