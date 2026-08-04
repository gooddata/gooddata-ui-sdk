// (C) 2007-2026 GoodData Corporation

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import {
    FLOATING_ELEMENT_DATA_ATTR,
    useRegisterFloatingAnchor,
} from "../../@ui/hooks/useCloseOnOutsideClick.js";
import { type IMenuPositionConfig } from "../MenuSharedTypes.js";

import {
    calculateMenuPosition,
    getElementDimensions,
    getElementDimensionsAndCoords,
    getViewportDimensionsAndCoords,
} from "./positioningCalculations.js";

export interface IPositionedMenuContentProps extends IMenuPositionConfig {
    topLevelMenu: boolean;
    togglerEl: HTMLElement | null;
    children: ReactNode;
}

export interface IPositionedMenuContentState {
    left: number;
    top: number;
}

export function PositionedMenuContent(props: IPositionedMenuContentProps) {
    const [state, setState] = useState<IPositionedMenuContentState>({
        left: 0,
        top: 0,
    });

    const menuElRef = useRef<HTMLDivElement>(null);

    // The menu portals to <body>, outside whatever opened it, so overlay/dialog outside-click
    // detection cannot attribute its clicks by DOM containment. Mark it as a floating element and
    // register the toggler as its anchor, so ownership resolves through the anchor chain (same
    // contract as UiFloatingElement).
    const assignMenuEl = useCallback((node: HTMLElement | null) => {
        menuElRef.current = node as HTMLDivElement | null;
    }, []);
    const setMenuElWithAnchorRegistry = useRegisterFloatingAnchor(assignMenuEl, props.togglerEl);

    const positionMenu = useCallback(() => {
        if (!props.togglerEl || !menuElRef.current) {
            return;
        }

        const { left, top } = calculateMenuPosition({
            toggler: getElementDimensionsAndCoords(props.togglerEl),
            menu: getElementDimensions(menuElRef.current),
            viewport: getViewportDimensionsAndCoords(),
            alignment: props.alignment,
            spacing: props.spacing,
            offset: props.offset,
            topLevelMenu: props.topLevelMenu,
        });

        setState({ left, top });
    }, [props.togglerEl, props.alignment, props.spacing, props.offset, props.topLevelMenu]);

    const addEventListeners = useCallback(() => {
        window.addEventListener("resize", positionMenu);
        window.addEventListener("scroll", positionMenu, true);
    }, [positionMenu]);

    const removeEventListeners = useCallback(() => {
        window.removeEventListener("resize", positionMenu);
        window.removeEventListener("scroll", positionMenu, true);
    }, [positionMenu]);

    useEffect(() => {
        positionMenu();
        addEventListeners();

        return () => {
            removeEventListeners();
        };
    }, [positionMenu, addEventListeners, removeEventListeners]);

    useEffect(() => {
        positionMenu();
    }, [
        props.alignment,
        props.spacing,
        props.offset,
        props.topLevelMenu,
        props.togglerEl,
        props.children,
        positionMenu,
    ]);

    return (
        <div
            style={{
                position: "absolute",
                left: state.left,
                top: state.top,
            }}
            ref={setMenuElWithAnchorRegistry}
            {...{ [FLOATING_ELEMENT_DATA_ATTR]: true }}
        >
            {props.children}
        </div>
    );
}
