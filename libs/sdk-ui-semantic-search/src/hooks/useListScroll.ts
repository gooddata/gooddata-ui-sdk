// (C) 2025 GoodData Corporation
import * as React from "react";
import { useLayoutEffect } from "react";

/*
 * This is the timeout used to wait for the list to change state
 * before scrolling to the selected item. It will feel more
 * natural to the user.
 */
const timeout = 30;

export function useListScroll<T>(selected: T, direction?: -1 | 0 | 1) {
    const [scrollTo, setScrollTo] = React.useState<T | undefined>(undefined);
    const [scrollDirection, setScrollDirection] = React.useState<-1 | 1>(1);

    useLayoutEffect(() => {
        const tm = setTimeout(() => {
            if (direction === 0) {
                setScrollTo(undefined);
                setScrollDirection(1);
                return;
            }
            setScrollTo(selected);
            setScrollDirection(direction ?? 1);
        }, timeout);
        return () => {
            clearTimeout(tm);
        };
    }, [selected, direction]);

    return [scrollTo, scrollDirection] as [T | undefined, -1 | 1];
}
