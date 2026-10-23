// (C) 2022-2026 GoodData Corporation

import { useEffect } from "react";

export function useChangeScroll(element: HTMLElement | null): void {
    useEffect(() => {
        if (!element) {
            return;
        }

        function transformScroll(event: WheelEvent) {
            if (!event.deltaY || !element) {
                return;
            }

            element.scrollLeft += event.deltaY + event.deltaX;
            event.preventDefault();
            event.stopPropagation();
        }

        element.addEventListener("wheel", transformScroll);
        return () => element.removeEventListener("wheel", transformScroll);
    }, [element]);
}
