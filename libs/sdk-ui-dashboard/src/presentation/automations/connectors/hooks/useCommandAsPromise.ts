// (C) 2026 GoodData Corporation

import { useCallback, useRef } from "react";

import type { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import type { DashboardCommands } from "../../../../model/commands/index.js";
import type { DashboardEventType } from "../../../../model/events/base.js";
import type { DashboardEvents } from "../../../../model/events/index.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";

import { sanitizeAutomationForSave } from "./sanitizeAutomationForSave.js";

type AutomationInput = IAutomationMetadataObjectDefinition | IAutomationMetadataObject;

/**
 * Wraps a Redux dashboard command in a promise-based API using a single-slot pending ref.
 * Sanitizes the input via sanitizeAutomationForSave before dispatching the command.
 *
 * @internal
 */
export function useCommandAsPromise<
    TIn extends AutomationInput,
    TSuccessEventType extends DashboardEventType,
    TOut,
>({
    commandCreator,
    successEvent,
    resolveWith,
}: {
    commandCreator: (input: TIn) => DashboardCommands;
    successEvent: TSuccessEventType;
    resolveWith: (event: Extract<DashboardEvents, { type: TSuccessEventType }>, input: TIn) => TOut;
}): (input: TIn) => Promise<TOut> {
    const pendingRef = useRef<{
        input: TIn;
        resolve: (result: TOut) => void;
        reject: (error: Error) => void;
    } | null>(null);

    const { run } = useDashboardCommandProcessing({
        commandCreator: (input: TIn) => commandCreator(sanitizeAutomationForSave(input) as TIn),
        successEvent,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED" as const,
        onSuccess: (event) => {
            if (pendingRef.current) {
                pendingRef.current.resolve(resolveWith(event, pendingRef.current.input));
                pendingRef.current = null;
            }
        },
        onError: (event) => {
            const error = event.payload.error ?? new Error(event.payload.message);
            pendingRef.current?.reject(error);
            pendingRef.current = null;
        },
    });

    return useCallback(
        (input: TIn): Promise<TOut> =>
            new Promise<TOut>((resolve, reject) => {
                pendingRef.current = { input, resolve, reject };
                run(input);
            }),
        [run],
    );
}

/**
 * Returns a stable callback that deletes an automation via the backend directly (no Redux command).
 *
 * @internal
 */
export function useDeleteAutomation(): (automation: IAutomationMetadataObject) => Promise<void> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return useCallback(
        async (automation: IAutomationMetadataObject): Promise<void> => {
            const automationService = backend.workspace(workspace).automations();
            await automationService.deleteAutomation(automation.id);
        },
        [backend, workspace],
    );
}
