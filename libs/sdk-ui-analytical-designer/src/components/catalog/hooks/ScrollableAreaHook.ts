// (C) 2019-2026 GoodData Corporation

import { useRef } from "react";

import { GOODSTRAP_SCROLLED_EVENT } from "@gooddata/sdk-ui-kit";
import { _debounce } from "@gooddata/util";

export const useScrollableArea = () => {
    const scrollableRef = useRef(null);
    const onScroll: () => void = _debounce(
        () => {
            if (scrollableRef.current !== null) {
                scrollableRef.current.dispatchEvent(
                    new CustomEvent(GOODSTRAP_SCROLLED_EVENT, { bubbles: true }),
                );
            }
        },
        100,
        { leading: true },
    );

    return {
        scrollableRef,
        onScroll,
    };
};
