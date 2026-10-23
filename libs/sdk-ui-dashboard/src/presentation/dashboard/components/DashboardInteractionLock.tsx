// (C) 2026 GoodData Corporation

import { type ReactNode, useLayoutEffect, useRef } from "react";

import cx from "classnames";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsAiLoading } from "../../../model/store/config/configSelectors.js";

interface IDashboardInteractionLockProps {
    className?: string;
    children: ReactNode;
}

export function DashboardInteractionLock({ className, children }: IDashboardInteractionLockProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const isAiLoading = useDashboardSelector(selectIsAiLoading);

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return;
        }

        const activeElement = content.ownerDocument.activeElement;
        if (isAiLoading) {
            content.setAttribute("inert", "");
            if (activeElement instanceof HTMLElement && content.contains(activeElement)) {
                activeElement.blur();
            }
        } else {
            content.removeAttribute("inert");
        }
    }, [isAiLoading]);

    return (
        <div
            className={cx(className, {
                "gd-dashboard-interaction-lock--active": isAiLoading,
            })}
        >
            <div className="gd-dashboard-interaction-lock__content" ref={contentRef}>
                {children}
            </div>
            {isAiLoading ? <div className="gd-dashboard-ai-building-overlay" aria-hidden="true" /> : null}
        </div>
    );
}
