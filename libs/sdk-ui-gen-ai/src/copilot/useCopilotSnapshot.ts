// (C) 2026 GoodData Corporation

import { useSyncExternalStore } from "react";

import { type CopilotHandler } from "./CopilotHandler.js";
import { type CopilotBuildType, type ICopilotSnapshot } from "./types.js";

/**
 * Subscribes a React component to a copilot handler's snapshot.
 *
 * @remarks
 * This optional React adapter does not own the handler. Unmounting or switching handlers
 * unsubscribes the component without disposing the handler.
 *
 * @param handler - Copilot instance to observe.
 * @returns The handler's current, referentially stable snapshot.
 * @alpha
 */
export function useCopilotSnapshot<TBuild extends string = CopilotBuildType>(
    handler: CopilotHandler<TBuild>,
): ICopilotSnapshot<TBuild> {
    return useSyncExternalStore(handler.subscribe, handler.getSnapshot, handler.getSnapshot);
}
