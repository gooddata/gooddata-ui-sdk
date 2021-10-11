// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { userInteractionTriggered } from "../events";

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

    const poweredByGDLogoClicked = useCallback(() => {
        eventDispatch(userInteractionTriggered("poweredByGDLogoClicked"));
    }, []);

    const kpiAlertDialogClosed = useCallback(() => {
        eventDispatch(userInteractionTriggered("kpiAlertDialogClosed"));
    }, []);

    const kpiAlertDialogOpened = useCallback((alreadyHasAlert: boolean) => {
        eventDispatch(
            userInteractionTriggered({ interaction: "kpiAlertDialogOpened", data: { alreadyHasAlert } }),
        );
    }, []);

    return {
        poweredByGDLogoClicked,
        kpiAlertDialogClosed,
        kpiAlertDialogOpened,
    };
};
