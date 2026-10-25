// (C) 2020-2026 GoodData Corporation

import { useEffect, useRef } from "react";

/**
 * Simple hook that returns false first time it is called, true at any other time.
 *
 * Can be used to determine if a functional react component is being rendered for the first time or
 * if it is a repeated subsequent render.
 */
export const useDidComponentMount = () => {
    const didMount = useRef(false);
    useEffect(() => {
        didMount.current = true;
    }, []);
    return didMount.current;
};
