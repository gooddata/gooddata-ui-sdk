// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { logUserInteraction, UserInteraction } from "../model/commands/logUserInteraction";
import { useDashboardDispatch } from "../model/state/dashboardStore";

/**
 * @internal
 */
export type UseLogUserInteraction = {
    [interaction in UserInteraction]: () => void;
};

/**
 * Hook for dispatching relevant user interaction logging commands.
 *
 * @internal
 */
export const useLogUserInteraction = (): UseLogUserInteraction => {
    const dispatch = useDashboardDispatch();

    const dispatchLogUserInteraction = (interaction: UserInteraction) =>
        dispatch(logUserInteraction(interaction));

    const poweredByGDLogoClicked = useCallback(() => {
        dispatchLogUserInteraction("poweredByGDLogoClicked");
    }, []);

    return {
        poweredByGDLogoClicked,
    };
};
