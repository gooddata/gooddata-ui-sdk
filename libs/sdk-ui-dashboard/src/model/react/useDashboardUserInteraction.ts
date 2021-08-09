// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";

import { userInteractionTriggered } from "../events/userInteraction";
import { useDashboardContext } from "./DashboardContextContext";
import { useDashboardEventDispatch } from "./useDashboardEventDispatch";

/**
 * Hook for dispatching relevant user interaction commands.
 * These commands enable to track user interactions that cannot be tracked by other existing events.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDashboardUserInteraction = () => {
    const eventDispatch = useDashboardEventDispatch();
    const ctx = useDashboardContext();

    const poweredByGDLogoClicked = useCallback(() => {
        eventDispatch(userInteractionTriggered(ctx, "poweredByGDLogoClicked"));
    }, []);

    const kpiAlertDialogClosed = useCallback(() => {
        eventDispatch(userInteractionTriggered(ctx, "kpiAlertDialogClosed"));
    }, []);

    const kpiAlertDialogOpened = useCallback((alreadyHasAlert: boolean) => {
        eventDispatch(
            userInteractionTriggered(ctx, { interaction: "kpiAlertDialogOpened", data: { alreadyHasAlert } }),
        );
    }, []);

    return {
        poweredByGDLogoClicked,
        kpiAlertDialogClosed,
        kpiAlertDialogOpened,
    };
};
