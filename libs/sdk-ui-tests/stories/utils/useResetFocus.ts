// (C) 2025 GoodData Corporation
import React from "react";

export const useResetFocus = (delay: number = 0): void => {
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            (document.activeElement as HTMLElement | null)?.blur();
        }, delay);

        return () => {
            clearTimeout(timeout);
        };
    }, [delay]);
};
