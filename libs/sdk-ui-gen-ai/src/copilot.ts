// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

/**
 * Reusable copilot workflows with plain immutable state and optional React integration.
 * @packageDocumentation
 * @alpha
 */

export { CopilotHandler } from "./copilot/CopilotHandler.js";
export { useCopilotSnapshot } from "./copilot/useCopilotSnapshot.js";
export { createCopilotState, transitionCopilot } from "./copilot/transitions.js";
export {
    selectCopilotGenerationPending,
    selectCopilotStatus,
    selectCopilotReasoningTitle,
    selectCopilotSource,
} from "./copilot/selectors.js";
export {
    CopilotBuildType,
    type CopilotStatus,
    type CopilotInput,
    type ICopilotTarget,
    type ICopilotContext,
    type ICopilotScope,
    type ICopilotSource,
    type ICopilotApplicationSource,
    type ICopilotInteraction,
    type ICopilotRequest,
    type ICopilotApplication,
    type ICopilotSnapshot,
    type ICopilotRegistration,
    type ICopilotConfiguration,
} from "./copilot/types.js";
