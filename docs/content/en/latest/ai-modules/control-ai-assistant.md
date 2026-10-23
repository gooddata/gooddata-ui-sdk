---
title: Control the AI Assistant
category: AI & Modules
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-gen-ai:useGenAiDispatcher"
  - "@gooddata/sdk-ui-gen-ai:makeUserItem"
source_files:
  - src/hooks/useGenAiDispatcher.ts
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/ai-modules/ai-assistant-layout
  - /docs/ai-modules/customize-ai-assistant
description: Get the AI Assistant store dispatcher, send messages, reset the thread, manage conversations, switch agents and context, and migrate from makeUserMessage to makeUserItem.
ai_generated_body: true
type: docs
weight: 54
section: AI & Modules
---

Drive the AI Assistant from your application by dispatching actions to its store. The [list of actions](../ai-assistant/#available-actions) is on the reference page.

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
