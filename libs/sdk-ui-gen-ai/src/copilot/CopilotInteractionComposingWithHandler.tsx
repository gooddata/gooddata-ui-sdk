// (C) 2026 GoodData Corporation

import { type CopilotHandler } from "./CopilotHandler.js";
import {
    CopilotInteractionComposing,
    type ICopilotInteractionComposingProps,
} from "./CopilotInteractionComposing.js";
import { selectCopilotReasoningTitle, selectCopilotStatus } from "./selectors.js";
import { type CopilotBuildType, type ICopilotScope } from "./types.js";
import { useCopilotSnapshot } from "./useCopilotSnapshot.js";

/** Composing presentation driven directly by an existing copilot instance. @alpha */
export interface ICopilotInteractionComposingWithHandlerProps<
    TBuild extends string = CopilotBuildType,
> extends Omit<ICopilotInteractionComposingProps, "status" | "reasoningTitle"> {
    /** Runtime-owned handler. This component never disposes it. */
    copilot: CopilotHandler<TBuild>;
    /** Workflow and optional target whose progress should be displayed. */
    scope: ICopilotScope<TBuild>;
}

/** Subscribe to a copilot instance without introducing another workflow state owner. @alpha */
export function CopilotInteractionComposingWithHandler<TBuild extends string = CopilotBuildType>({
    copilot,
    scope,
    ...props
}: ICopilotInteractionComposingWithHandlerProps<TBuild>) {
    const snapshot = useCopilotSnapshot(copilot);

    return (
        <CopilotInteractionComposing
            {...props}
            status={selectCopilotStatus(snapshot, scope)}
            reasoningTitle={selectCopilotReasoningTitle(snapshot)}
        />
    );
}
