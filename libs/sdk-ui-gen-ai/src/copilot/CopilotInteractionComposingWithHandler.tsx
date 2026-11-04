// (C) 2026 GoodData Corporation

import { type CopilotHandler } from "./CopilotHandler.js";
import {
    CopilotInteractionComposing,
    type ICopilotInteractionComposingProps,
} from "./CopilotInteractionComposing.js";
import { selectCopilotReasoningTitle, selectCopilotReplyThreadId, selectCopilotStatus } from "./selectors.js";
import { type CopilotBuildType, type ICopilotScope } from "./types.js";
import { useCopilotSnapshot } from "./useCopilotSnapshot.js";

/** Composing presentation driven directly by an existing copilot instance. @alpha */
export interface ICopilotInteractionComposingWithHandlerProps<
    TBuild extends string = CopilotBuildType,
> extends Omit<ICopilotInteractionComposingProps, "status" | "reasoningTitle" | "onReplyInChat"> {
    /** Runtime-owned handler. This component never disposes it. */
    copilot: CopilotHandler<TBuild>;
    /** Workflow and optional target whose progress should be displayed. */
    scope: ICopilotScope<TBuild>;
    /** Open the waiting workflow's originating thread; falls back to the foreground thread. */
    onReplyInChat?: (threadId?: string) => void;
}

/** Subscribe to a copilot instance without introducing another workflow state owner. @alpha */
export function CopilotInteractionComposingWithHandler<TBuild extends string = CopilotBuildType>({
    copilot,
    scope,
    onReplyInChat,
    ...props
}: ICopilotInteractionComposingWithHandlerProps<TBuild>) {
    const snapshot = useCopilotSnapshot(copilot);

    return (
        <CopilotInteractionComposing
            {...props}
            status={selectCopilotStatus(snapshot, scope)}
            reasoningTitle={selectCopilotReasoningTitle(snapshot, scope)}
            onReplyInChat={
                onReplyInChat
                    ? () => onReplyInChat(selectCopilotReplyThreadId(copilot.getSnapshot(), scope))
                    : undefined
            }
        />
    );
}
