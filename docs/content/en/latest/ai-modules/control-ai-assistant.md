---
title: Control the AI Assistant
category: AI & Modules
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-gen-ai:useGenAiDispatcher"
  - "@gooddata/sdk-ui-gen-ai:makeUserItem"
  - "@gooddata/sdk-ui-gen-ai:CopilotHandler"
  - "@gooddata/sdk-ui-gen-ai:CopilotBuildType"
source_files:
  - src/hooks/useGenAiDispatcher.ts
  - src/copilot/CopilotHandler.ts
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/ai-modules/ai-assistant-layout
  - /docs/ai-modules/customize-ai-assistant
description: Get the AI Assistant store dispatcher, manage conversations and context, cancel stale dashboard builds on navigation, and migrate from makeUserMessage to makeUserItem.
ai_generated_body: true
type: docs
weight: 54
section: AI & Modules
---

Drive the AI Assistant from your application by dispatching actions to its store. The [list of actions](../ai-assistant/#available-actions) is on the reference page.

If you use `useDashboardCopilot`, call its `sendMessage(message)` helper to send a message in the current
conversation, or `generateDashboard(message)` to start a new dashboard conversation. The latter requires an
initialized, empty dashboard in edit mode. See [Connect the assistant to a dashboard](../ai-assistant-layout/#connect-the-assistant-to-a-dashboard)
for setup and [hook return values](../ai-assistant/#usedashboardcopilot-hook) for all helpers. To also access the
dispatcher, pass `onDispatcher` through `genAiStoreProps({ onDispatcher })` on the outer `GenAiStore`.

## Get the dispatcher

Take the dispatcher from the `onDispatcher` callback of `GenAIAssistant` or `GenAiStore`:

```tsx
import { useState } from "react";
import { GenAIAssistant, type GenAIAssistantProps } from "@gooddata/sdk-ui-gen-ai";

type ChatDispatcher = Parameters<NonNullable<GenAIAssistantProps["onDispatcher"]>>[0];

export const App = () => {
    const [dispatcher, setDispatcher] = useState<ChatDispatcher | null>(null);

    return <GenAIAssistant onDispatcher={(dispatch) => setDispatcher(() => dispatch)} />;
};
```

Inside a `GenAiStore`, call the `useGenAiDispatcher` hook instead:

```tsx
import { useGenAiDispatcher, startNewConversationAction } from "@gooddata/sdk-ui-gen-ai";

const MyComponent = () => {
    const dispatch = useGenAiDispatcher();

    const handleNewConversation = () => {
        dispatch(startNewConversationAction());
    };

    return <button onClick={handleNewConversation}>New Conversation</button>;
};
```

## Reset the chat thread

Dispatch `clearThreadAction`:

```tsx
import { clearThreadAction } from "@gooddata/sdk-ui-gen-ai";

// Retrieve dispatcher from chat UI
dispatcher(clearThreadAction());
```

## Send messages and manage conversations

The examples below use `dispatcher` from the previous section. `conversation` is an `IChatConversationLocal`, for example from `useGenAiCurrentConversation`, and `userContext` is an `IGenAIUserContext`.

```tsx
import {
    clearThreadAction,
    startNewConversationAction,
    setCurrentConversationAction,
    setFullscreenAction,
    newMessageAction,
    pinConversationAction,
    renameConversationAction,
    deleteConversationAction,
    setSelectedAgentAction,
    setAmbientUserContextAction,
    setUserContextAction,
    makeUserItem,
} from "@gooddata/sdk-ui-gen-ai";

// Retrieve dispatcher from chat UI

// Clear thread action
dispatcher(clearThreadAction());
// For case with single conversation only
dispatcher(newMessageAction(makeUserItem({ type: "text", text: "Hello" })));
// For case with multiple conversations
dispatcher(startNewConversationAction());
dispatcher(setCurrentConversationAction({ conversation }));
dispatcher(newMessageAction(makeUserItem({ type: "text", text: "Hello" })));

// Switch the assistant to the fullscreen layout
dispatcher(setFullscreenAction({ isFullscreen: true }));

// Pin/unpin conversation
dispatcher(pinConversationAction({ conversation, pinned: true }));

// Rename conversation
dispatcher(renameConversationAction({ conversation, title: "Weekly performance review" }));

// Delete conversation
dispatcher(deleteConversationAction({ conversation }));

// Change assistant agent
dispatcher(setSelectedAgentAction({ agentId: "new-agent-id", showChangeEvent: true }));

// Set ambient user context
dispatcher(setAmbientUserContextAction({ userContext }));

// Set or merge user context
dispatcher(setUserContextAction({ userContext, replaceUserContext: true }));
```

## Cancel stale dashboard builds on navigation

If your application keeps a dashboard mounted across route changes, handle navigation away from an active,
unsaved AI draft, including browser Back and Forward. Detect when the destination draft identifier changes or
is removed; don't cancel for unrelated URL changes. `useDashboardCopilot` doesn't monitor your application's routes.

Use the `copilot` returned by `useDashboardCopilot` to call
`copilot.cancelStaleBuild(CopilotBuildType.Dashboard, nextDashboardId)`. Import `CopilotBuildType` from
`@gooddata/sdk-ui-gen-ai`. Pass the destination draft identifier, or `undefined` when leaving the builder.
This API is `@alpha`.

- `false`: an application of a dashboard definition to the destination is in progress. Nothing changes;
  preserve the intentional draft-opening flow.
- `true`: dashboard generation intent is cleared and pending dashboard definition applications are interrupted.
  Other build types are unaffected. Your application must still discard the stale editing session and either
  leave the editor or load the destination before allowing Save.

For a custom draft-opening flow, register the application with `definitionApplicationStarted` before changing
the URL. After applying the definition, acknowledge it with `definitionApplied`, or call
`definitionApplicationInterrupted` if application fails. This lets `cancelStaleBuild` distinguish an intentional
Open from history navigation while application is pending.

Previously applied definitions and a matching dashboard identifier in the handler context do not prevent
cancellation. Don't use `hasDefinition` to check which draft is currently on the canvas: it remembers pending
and previously applied definitions, not the current canvas identity.

Like `cancelGeneration()`, this method doesn't stop an assistant response that is already streaming. It doesn't
clear the dashboard canvas, exit edit mode, navigate, or restore the destination draft.

## Migrate from makeUserMessage to makeUserItem

If your integration still sends messages like this:

```tsx
dispatcher(newMessageAction(makeUserMessage([makeTextContents("Hello", [])])));
```

Migrate to `makeUserItem`:

```tsx
dispatcher(newMessageAction(makeUserItem({ type: "text", text: "Hello" })));
```

When migrating, remove `makeUserMessage` and `makeTextContents` from imports and use `makeUserItem` for new user chat items.
