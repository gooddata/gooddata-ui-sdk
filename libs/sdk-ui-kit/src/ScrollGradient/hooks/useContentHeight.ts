// (C) 2022 GoodData Corporation

import { useEffect, useState } from "react";

export function useContentHeight(element: HTMLElement | null) {
    const [contentHeight, setContentHeight] = useState(-1);

    useEffect(() => {
        let id = -1;

        function onFrame() {
            if (element && contentHeight !== element.scrollHeight) {
                setContentHeight(element.scrollHeight);
            }
            id = window.requestAnimationFrame(onFrame);
        }

        id = window.requestAnimationFrame(onFrame);
        return () => window.cancelAnimationFrame(id);
    }, [element, contentHeight, setContentHeight]);

    return contentHeight;
}
