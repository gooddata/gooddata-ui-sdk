// (C) 2007-2025 GoodData Corporation
import React, { useEffect, useCallback } from "react";

import { OpenAction, IMenuPositionConfig, OnOpenedChange } from "./MenuSharedTypes.js";
import { MenuOpener } from "./menuOpener/MenuOpener.js";

export interface IControlledMenuProps extends Partial<IMenuPositionConfig> {
    opened: boolean;
    openAction?: OpenAction;
    closeOnScroll: boolean;
    portalTarget: Element | undefined;
    onOpenedChange: OnOpenedChange;
    toggler: React.ReactNode;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
}

export function ControlledMenu({
    opened,
    openAction,
    closeOnScroll,
    portalTarget,
    onOpenedChange,
    toggler,
    togglerWrapperClassName,
    children,
    alignment,
    spacing,
    offset,
}: IControlledMenuProps) {
    const closeMenu = useCallback(() => {
        onOpenedChange({ opened: false, source: "SCROLL" });
    }, [onOpenedChange]);

    const addScrollListeners = useCallback(() => {
        window.addEventListener("scroll", closeMenu, true);
    }, [closeMenu]);

    const removeScrollListeners = useCallback(() => {
        window.removeEventListener("scroll", closeMenu, true);
    }, [closeMenu]);

    useEffect(() => {
        if (closeOnScroll) {
            addScrollListeners();
        }

        return () => {
            if (closeOnScroll) {
                removeScrollListeners();
            }
        };
    }, [closeOnScroll, addScrollListeners, removeScrollListeners]);

    return (
        <MenuOpener
            opened={opened}
            onOpenedChange={onOpenedChange}
            openAction={openAction}
            alignment={alignment}
            spacing={spacing}
            offset={offset}
            portalTarget={portalTarget}
            toggler={toggler}
            togglerWrapperClassName={togglerWrapperClassName}
            topLevelMenu={true}
        >
            {children}
        </MenuOpener>
    );
}
