// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import { useDashboardCommand } from "./useDashboardCommand.js";
import { type DashboardCommands } from "../commands/index.js";
import { type DashboardEventType } from "../events/base.js";
import { type DashboardEvents } from "../events/index.js";

/**
 * @internal
 */
export type CommandProcessingStatus = "running" | "success" | "error";

/**
 * @internal
 */
export const useDashboardCommandProcessing = <
    TCommand extends DashboardCommands,
    TCommandCreatorArgs extends any[],
    TSuccessEventType extends DashboardEventType,
    TErrorEventType extends DashboardEventType,
>({
    commandCreator,
    successEvent,
    errorEvent,
    onSuccess,
    onError,
    onBeforeRun,
}: {
    commandCreator: (...args: TCommandCreatorArgs) => TCommand;
    successEvent: TSuccessEventType;
    errorEvent: TErrorEventType;
    onSuccess?: (event: Extract<DashboardEvents, { type: TSuccessEventType }>) => void;
    onError?: (event: Extract<DashboardEvents, { type: TErrorEventType }>) => void;
    onBeforeRun?: (command: TCommand) => void;
}): {
    run: (...args: TCommandCreatorArgs) => void;
    status?: CommandProcessingStatus;
} => {
    const [status, setStatus] = useState<CommandProcessingStatus>();
    const run = useDashboardCommand(
        commandCreator,
        {
            [successEvent]: (event: Extract<DashboardEvents, { type: TSuccessEventType }>) => {
                setStatus("success");
                onSuccess?.(event);
            },
            [errorEvent]: (event: Extract<DashboardEvents, { type: TErrorEventType }>) => {
                setStatus("error");
                onError?.(event);
            },
        },
        (cmd) => {
            setStatus("running");
            onBeforeRun?.(cmd);
        },
    );

    return {
        run,
        status,
    };
};
