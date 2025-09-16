// (C) 2007-2025 GoodData Corporation

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import {
    calculateMenuPosition,
    getElementDimensions,
    getElementDimensionsAndCoords,
    getViewportDimensionsAndCoords,
} from "./positioningCalculations.js";
import { IMenuPositionConfig } from "../MenuSharedTypes.js";

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
            ref={menuElRef}
        >
            {props.children}
        </div>
    );
}
