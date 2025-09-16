// (C) 2024-2025 GoodData Corporation

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";

import { AnyAction } from "@reduxjs/toolkit";

import { ScreenSize } from "@gooddata/sdk-model";

import {
    selectScreen,
    setScreenSize as setScreenSizeAction,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { DASHBOARD_LAYOUT_BREAK_POINTS } from "../../constants/index.js";

const getCurrentScreenSize = (): ScreenSize | undefined => {
    let viewportWidth = 0;
    if (typeof window !== "undefined" && window.innerWidth) {
        viewportWidth = window.innerWidth;
    }

    if (viewportWidth === 0) {
        return undefined;
    }

    if (viewportWidth >= DASHBOARD_LAYOUT_BREAK_POINTS[3]) {
        return "xl";
    }
    if (viewportWidth >= DASHBOARD_LAYOUT_BREAK_POINTS[2]) {
        return "lg";
    }
    if (viewportWidth >= DASHBOARD_LAYOUT_BREAK_POINTS[1]) {
        return "md";
    }
    if (viewportWidth >= DASHBOARD_LAYOUT_BREAK_POINTS[0]) {
        return "sm";
    }
    return "xs";
};

function setNewSize(
    prevSize: ScreenSize | undefined,
    setScreenSize: Dispatch<SetStateAction<ScreenSize | undefined>>,
    dispatch: Dispatch<AnyAction>,
) {
    const newSize = getCurrentScreenSize();

    if (newSize && newSize !== prevSize) {
        // prevent unnecessary re-renders
        setScreenSize(newSize);
        dispatch(setScreenSizeAction(newSize));
    }
}

export interface IDashboardSizeContextProps {
    children: ReactNode;
}

const DashboardScreenSizeContext = createContext<ScreenSize | undefined>(undefined);
DashboardScreenSizeContext.displayName = "DashboardScreenSizeContext";

export function DashboardScreenSizeProvider({ children }: IDashboardSizeContextProps) {
    const [screenSize, setScreenSize] = useState<ScreenSize | undefined>();
    const dispatch = useDashboardDispatch();

    const appStateScreenSize = useDashboardSelector(selectScreen);

    useEffect(() => {
        // set initial screen size to app state for usage in sagas
        setNewSize(screenSize, setScreenSize, dispatch);

        // register event listener for window resize
        const handleWindowResized = () => {
            setNewSize(screenSize, setScreenSize, dispatch);
        };
        window.addEventListener("resize", handleWindowResized, false);
        return () => {
            window.removeEventListener("resize", handleWindowResized, false);
        };
    }, [screenSize, dispatch]);

    return (
        <div className="s-screen-size-container">
            <DashboardScreenSizeContext.Provider value={screenSize}>
                {appStateScreenSize ? children : null}
            </DashboardScreenSizeContext.Provider>
        </div>
    );
}

/**
 * Return current screen size.
 */
export const useScreenSize = (): ScreenSize => {
    const screenSize = useContext(DashboardScreenSizeContext);
    return screenSize ?? "xl";
};
