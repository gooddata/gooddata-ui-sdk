// (C) 2024 GoodData Corporation

import React, { useState, useEffect, useContext } from "react";
import { ScreenSize } from "@gooddata/sdk-model";

import { DASHBOARD_LAYOUT_BREAK_POINTS } from "../../constants/index.js";

const getScreenSize = (ref: React.RefObject<HTMLDivElement>): ScreenSize => {
    if (!ref.current) {
        return "xl";
    }
    const viewportWidth = ref.current.clientWidth;
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

export interface IDashboardSizeContextProps {
    children: React.ReactNode;
}

const DashboardScreenSizeContext = React.createContext<ScreenSize | undefined>(undefined);
DashboardScreenSizeContext.displayName = "DashboardScreenSizeContext";

export const DashboardScreenSizeProvider: React.FC<IDashboardSizeContextProps> = ({ children }) => {
    const layoutRef = React.useRef<HTMLDivElement>(null);
    const [screenSize, setScreenSize] = useState(() => getScreenSize(layoutRef));

    useEffect(() => {
        const handleWindowResized = () => setScreenSize(getScreenSize(layoutRef));
        window.addEventListener("resize", handleWindowResized, false);
        return () => {
            window.removeEventListener("resize", handleWindowResized, false);
        };
    }, [layoutRef]);

    return (
        <div ref={layoutRef}>
            <DashboardScreenSizeContext.Provider value={screenSize}>
                {children}
            </DashboardScreenSizeContext.Provider>
        </div>
    );
};

/**
 * Return current screen size.
 */
export const useScreenSize = (): ScreenSize => {
    const screenSize = useContext(DashboardScreenSizeContext);
    return screenSize ?? "xl";
};
