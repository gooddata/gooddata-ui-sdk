// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";

import { userInteraction } from "../commands/userInteraction";
import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Hook for dispatching relevant user interaction commands.
 * These commands enable to track user interactions that cannot be tracked by other existing events.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDashboardUserInteraction = () => {
    const dispatch = useDashboardDispatch();

    const poweredByGDLogoClicked = useCallback(() => {
        dispatch(userInteraction("poweredByGDLogoClicked"));
    }, []);

    const kpiAlertDialogClosed = useCallback(() => {
        dispatch(userInteraction("kpiAlertDialogClosed"));
    }, []);

    const kpiAlertDialogOpened = useCallback((alreadyHasAlert: boolean) => {
        dispatch(userInteraction({ interaction: "kpiAlertDialogOpened", data: { alreadyHasAlert } }));
    }, []);

    return {
        poweredByGDLogoClicked,
        kpiAlertDialogClosed,
        kpiAlertDialogOpened,
    };
};
