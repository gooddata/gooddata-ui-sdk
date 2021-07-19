// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";

import { userInteraction, UserInteractionType } from "../commands/userInteraction";
import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * @internal
 */
export type UseDashboardUserInteraction = {
    [interaction in UserInteractionType]: () => void;
};

/**
 * Hook for dispatching relevant user interaction commands.
 * These commands enable to track user interactions that cannot be tracked by other existing events.
 *
 * @internal
 */
export const useDashboardUserInteraction = (): UseDashboardUserInteraction => {
    const dispatch = useDashboardDispatch();

    const dispatchLogUserInteraction = (interaction: UserInteractionType) =>
        dispatch(userInteraction(interaction));

    const poweredByGDLogoClicked = useCallback(() => {
        dispatchLogUserInteraction("poweredByGDLogoClicked");
    }, []);

    return {
        poweredByGDLogoClicked,
    };
};
