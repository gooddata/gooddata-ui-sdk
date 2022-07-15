// (C) 2019-2022 GoodData Corporation
import { useEffect } from "react";

const SCROLL_STEP_SIZE = 10;
const SCROLL_ZONE_HEIGHT_TOP = 105;
const SCROLL_ZONE_HEIGHT_BOTTOM = 20;

function checkScroll(e: MouseEvent) {
    if (e.clientY < SCROLL_ZONE_HEIGHT_TOP) {
        window.scrollBy(0, -SCROLL_STEP_SIZE);
    } else if (e.clientY > window.innerHeight - SCROLL_ZONE_HEIGHT_BOTTOM) {
        window.scrollBy(0, SCROLL_STEP_SIZE);
    }
}

export function useScrolling(isDragging: boolean) {
    useEffect(() => {
        if (isDragging) {
            // there is false positive alarm in sonar rule, we need to disable it (https://github.com/SonarSource/SonarJS/issues/2666)
            window.addEventListener("drag", checkScroll); //NOSONAR
        }

        return () => {
            window.removeEventListener("drag", checkScroll);
        };
    }, [isDragging]);
}
