// (C) 2025 GoodData Corporation
import { useEffect, useRef } from "react";

export function useMounted() {
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    return mounted;
}
