// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { DashboardCommands } from "../commands";

import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Hook that takes command creator and returns function that will result into dispatching this command.

 * @param commandCreator - command factory
 * @returns callback that dispatches the command
 * @alpha
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
