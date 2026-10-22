// (C) 2024-2026 GoodData Corporation

import {
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { type AnyAction } from "@reduxjs/toolkit";

import { type ScreenSize } from "@gooddata/sdk-model";

import { setScreenSize as setScreenSizeAction } from "../../../model/commands/layout.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectScreen } from "../../../model/store/tabs/layout/layoutSelectors.js";
import { DASHBOARD_LAYOUT_BREAK_POINTS } from "../../constants/layout.js";

const getCurrentScreenSize = (isEditMode: boolean): ScreenSize | undefined => {
    let viewportWidth = 0;
    if (window?.innerWidth) {
        viewportWidth = window.innerWidth;
    }

    if (viewportWidth === 0) {
        return undefined;
    }

    if (viewportWidth >= DASHBOARD_LAYOUT_BREAK_POINTS[3]) {
        return "xl";
    }
    // Only xl sizes are saved, so edit mode keeps the desktop grid instead of reflowing it.
    if (isEditMode || viewportWidth >= DASHBOARD_LAYOUT_BREAK_POINTS[2]) {
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
    isEditMode: boolean,
    setScreenSize: Dispatch<SetStateAction<ScreenSize | undefined>>,
    dispatch: Dispatch<AnyAction>,
) {
    const newSize = getCurrentScreenSize(isEditMode);

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
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    useEffect(() => {
        // set initial screen size to app state for usage in sagas
        setNewSize(screenSize, isEditMode, setScreenSize, dispatch);

        // register event listener for window resize
        const handleWindowResized = () => {
            setNewSize(screenSize, isEditMode, setScreenSize, dispatch);
        };
        window.addEventListener("resize", handleWindowResized, false);
        return () => {
            window.removeEventListener("resize", handleWindowResized, false);
        };
    }, [screenSize, isEditMode, dispatch]);

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
