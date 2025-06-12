// (C) 2022 GoodData Corporation

import { useEffect, useRef, useLayoutEffect } from "react";

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
