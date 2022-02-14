// (C) 2020-2022 GoodData Corporation
import { useCallback } from "react";
import { DashboardCommands } from "../commands";

import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Hook that takes command creator and returns function that will result into dispatching this command.
 *
 * The created function takes original command creators parameters as per example below.
 *
 * @example
 * ```
 * // create a dashboard command to reset AttributeFilter selection
 * const resetAttributeFilter = useDispatchDashboardCommand(resetAttributeFilterSelection);
 *
 * // somewhere else in the code call the command to reset the filters
 * **
 * resetAttributeFilter(<dashboard-local-id>);
 * **
 * ```
 *
 * To convert {@link @gooddata/sdk-model#IPositiveAttributeFilter} or {@link @gooddata/sdk-model#INegativeAttributeFilter} to {@link @gooddata/sdk-model#IFilter} use
 * {@link dashboardAttributeFilterToAttributeFilter}. For date filter, use {@link dashboardDateFilterToDateFilterByWidget} or
 * {@link dashboardDateFilterToDateFilterByDateDataSet}, depending on whether you have widget or dateDataSet available.
 * Converted filter can be used within the command's payload.
 *
 * @param commandCreator - command factory
 * @returns callback that dispatches the command
 * @public
 */
export const useDispatchDashboardCommand = <TCommand extends DashboardCommands, TArgs extends any[]>(
    commandCreator: (...args: TArgs) => TCommand,
): ((...args: TArgs) => void) => {
    const dispatch = useDashboardDispatch();

    const run = useCallback(
        (...args: TArgs) => {
            const command = commandCreator(...args);
            dispatch(command);
        },
        [commandCreator],
    );

    return run;
};
