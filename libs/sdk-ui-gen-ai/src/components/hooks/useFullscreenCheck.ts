// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { useMediaQuery } from "@gooddata/sdk-ui-kit";

import { isFullscreenSelector } from "../../store/index.js";

export function useFullscreenCheck() {
    const isFullscreenCurrent = useSelector(isFullscreenSelector);
    const isSmallScreen = useMediaQuery("mobileDevice");
    const isBigScreen = useMediaQuery(">=lg");
    const isFullscreen = isSmallScreen || isFullscreenCurrent;

    return {
        isFullscreen,
        isSmallScreen,
        isBigScreen,
    };
}
