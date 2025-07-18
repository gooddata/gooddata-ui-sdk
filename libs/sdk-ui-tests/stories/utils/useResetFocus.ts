// (C) 2025 GoodData Corporation
import { useEffect } from "react";

export const useResetFocus = (delay: number = 0): void => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            (document.activeElement as HTMLElement | null)?.blur();
        }, delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [delay]);
};
