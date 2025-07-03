// (C) 2025 GoodData Corporation

import { useMemo } from "react";

const SHOW_SHARE_BUTTON_PARAM = "showShareButton";

export const useDashboardSearchParams = () => {
    //only used with iframe
    const searchParams = useMemo(() => {
        return new URLSearchParams(window.location.search);
    }, []);

    const isDashboardShareButtonDisabledFromUrl = useMemo(() => {
        return searchParams.get(SHOW_SHARE_BUTTON_PARAM) === "false";
    }, []);

    return { isDashboardShareButtonDisabledFromUrl };
};
