// (C) 2007-2025 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import { type IMenuOpenedBySharedProps } from "./MenuOpenedBySharedProps.js";
import { MenuPosition } from "../positioning/MenuPosition.js";

export function MenuOpenedByHover({
    onOpenedChange,
    toggler,
    togglerWrapperClassName,
    opened,
    topLevelMenu,
    alignment,
    spacing,
    offset,
    portalTarget,
    children,
}: IMenuOpenedBySharedProps) {
    const openCloseDelayMs = 200;

    const timerCloseDelay = useRef<number | null>(null);

    const clearCloseDelayTimer = useCallback((): void => {
        if (timerCloseDelay.current) {
            window.clearTimeout(timerCloseDelay.current);
        }
    }, []);

    useEffect(() => {
        return () => {
            clearCloseDelayTimer();
        };
    }, [clearCloseDelayTimer]);

    const hoverStart = useCallback((): void => {
        clearCloseDelayTimer();
        timerCloseDelay.current = window.setTimeout(() => {
            onOpenedChange({ opened: true, source: "HOVER_TIMEOUT" });
        }, openCloseDelayMs);
    }, [clearCloseDelayTimer, onOpenedChange]);

    const hoverEnd = useCallback((): void => {
        clearCloseDelayTimer();
        timerCloseDelay.current = window.setTimeout(() => {
            onOpenedChange({ opened: false, source: "HOVER_TIMEOUT" });
        }, openCloseDelayMs);
    }, [clearCloseDelayTimer, onOpenedChange]);

    return (
        <MenuPosition
            toggler={
                <div onMouseEnter={hoverStart} onMouseLeave={hoverEnd}>
                    {toggler}
                </div>
            }
            togglerWrapperClassName={togglerWrapperClassName}
            opened={opened}
            topLevelMenu={topLevelMenu}
            alignment={alignment}
            spacing={spacing}
            offset={offset}
            portalTarget={portalTarget}
        >
            <div onMouseEnter={hoverStart} onMouseLeave={hoverEnd}>
                {children}
            </div>
        </MenuPosition>
    );
}
