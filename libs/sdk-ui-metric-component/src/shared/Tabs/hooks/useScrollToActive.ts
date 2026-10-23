// (C) 2022-2026 GoodData Corporation

import { useEffect } from "react";

import { TabActive, TabRoot } from "../Tab.js";

export function useScrollToActive(
    element: HTMLElement | null,
    active: number,
    enabled: boolean,
    space = 3,
): void {
    useEffect(() => {
        if (!element) {
            return;
        }

        const { offsetWidth, scrollLeft } = element;
        const [start, end] = [scrollLeft, scrollLeft + offsetWidth];
        const activeTab = element.querySelector<HTMLDivElement>(`.${TabRoot}.${TabActive}`);

        if (!activeTab) {
            return;
        }

        const isBefore = activeTab.offsetLeft < start;
        const isAfter = activeTab.offsetLeft + activeTab.offsetWidth > end;

        if (isBefore) {
            scrollToLeft(element, activeTab, activeTab.offsetLeft - space);
        }
        if (isAfter) {
            scrollToLeft(
                element,
                activeTab,
                activeTab.offsetLeft + activeTab.offsetWidth - offsetWidth + space,
            );
        }
    }, [element, active, enabled, space]);
}

function scrollToLeft(element: HTMLElement, activeTab: HTMLElement, left: number) {
    if (element.scrollTo) {
        element.scrollTo({
            left,
            top: 0,
            behavior: "smooth",
        });
    } else {
        activeTab.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    }
}
