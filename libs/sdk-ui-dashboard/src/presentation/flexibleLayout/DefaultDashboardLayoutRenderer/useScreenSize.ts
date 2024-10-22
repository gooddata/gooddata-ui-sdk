// (C) 2024 GoodData Corporation

import React, { useEffect, useState } from "react";
import { ScreenSize } from "@gooddata/sdk-model";

import { DASHBOARD_LAYOUT_BREAK_POINTS } from "../../constants/index.js";

const getScreenClass = (ref: React.RefObject<HTMLDivElement>): ScreenSize => {
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

export const useScreenSize = (ref: React.RefObject<HTMLDivElement>): ScreenSize => {
    const [screenClass, setScreenClass] = useState(() => getScreenClass(ref));
    useEffect(() => {
        const handleWindowResized = () => setScreenClass(getScreenClass(ref));
        window.addEventListener("resize", handleWindowResized, false);
        return () => {
            window.removeEventListener("resize", handleWindowResized, false);
        };
    }, [ref]);
    return screenClass;
};
