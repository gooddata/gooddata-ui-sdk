---
legacy_path: references/embed_ai_assistant
title: AI Assistant
category: AI & Modules
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-gen-ai:GenAIAssistant"
  - "@gooddata/sdk-ui-gen-ai:GenAIConversations"
  - "@gooddata/sdk-ui-gen-ai:GenAiStore"
  - "@gooddata/sdk-ui-gen-ai:IGenAIAssistantSlots"
  - "@gooddata/sdk-ui-gen-ai:useGenAiDispatcher"
  - "@gooddata/sdk-ui-gen-ai:GenAiInteractionIntelligence"
source_files:
  - src/components/GenAIChat.tsx
  - src/components/GenAiConversations.tsx
  - src/components/GenAiStore.tsx
  - src/hooks/useGenAiDispatcher.ts
related_pages:
  - /docs/ai-modules/ai-assistant-layout
  - /docs/ai-modules/customize-ai-assistant
  - /docs/ai-modules/control-ai-assistant
  - /docs/integrations/web-components/ai-assistant-custom-element
  - /docs/ai-modules/key-driver-analysis
type: docs
description: Components, events, slots, and actions of the AI Assistant chat in @gooddata/sdk-ui-gen-ai.
weight: 51
section: AI & Modules
aliases:
  - "../references/embed_ai_assistant/"
  - "../references/embed_ai_assistant/assistant_conversations_integration/"
---

`@gooddata/sdk-ui-gen-ai` embeds the chat of the GoodData AI Assistant in a React application. This page lists its components, events, slots, and actions. For step-by-step tasks, see [Combine the AI Assistant with your app](../ai-assistant-layout/), [Customize the AI Assistant](../customize-ai-assistant/), and [Control the AI Assistant from your code](../control-ai-assistant/).

{{< figure src="/gd-ui/ai-assistant.png" alt="AI Assistant chat with a user question, the assistant's answer with a bar chart of gross profit by product category, follow-up buttons, feedback buttons, and the chat input" >}}

## Prerequisites

The component shows the AI Assistant that your GoodData organization runs; it doesn't set it up. Before you
embed it:

- Turn on and configure the AI Assistant, including which users get the AI Assistant workspace permission. See
  [Configure AI Assistant](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/configure-ai-assistant/).
- Connect a language model. See [Configure LLM Providers and Models for AI Assistant](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/llm-providers/).
- Decide what data the assistant may send to the model. See [Sharing Data With AI](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/data-sharing/).

Which AI features you get depends on your GoodData plan and entitlements. On GoodData.CN, the AI setup differs;
check the GoodData.CN documentation for your version.

## Components

| Component | What it renders |
| --- | --- |
| `GenAIAssistant` | The chat: message history and the input. It fills its parent element and doesn't manage an overlay, so put it in a container of the size you want. |
| `GenAIConversations` | The conversations list, for layouts that show it next to the chat. |
| `GenAiStore` | No UI. Shares one state and dispatcher between the AI Assistant components inside it. |
| `GenAiKeyDriverAnalysis` | The Key Driver Analysis dialog for charts in the chat. See [Key Driver Analysis component](#key-driver-analysis-component). |
| `GenAiInteractionIntelligence` | The Interaction Intelligence panel, for custom layouts inside `GenAiStore`. See [Interaction Intelligence](#interaction-intelligence). |

The components support theming through the [Theme Provider](../../integrations/embedding/apply-theming/).

## Basic usage

```tsx
import {
    GenAIAssistant,
    ChatUserMessageEvent,
    isChatUserMessageEvent,
    LinkHandlerEvent,
} from "@gooddata/sdk-ui-gen-ai";

// Import required styles
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const App = () => {
    return (
        <div style={{ width: 500, height: 600, display: "flex" }}>
            {/* Wrap the chat UI in a container of desired size */}
            <GenAIAssistant
                // Optionally, add event listeners
                eventHandlers={[
                    {
                        eval: isChatUserMessageEvent,
                        handler: (event: ChatUserMessageEvent) => {
                            console.log(`User message: ${event.question}`);
                        },
                    },
                ]}
                // Optionally, provide links handler
                onLinkClick={(linkClickEvent: LinkHandlerEvent) => {
                    linkClickEvent.preventDefault();
                    console.log(`User click: ${linkClickEvent.itemUrl}`);
                    // For example, when the user asks the assistant to find
                    // a specific dashboard and clicks the result
                }}
                // Optionally, provide dispatcher for sending messages in the chat
                onDispatcher={(dispatch) => {
                    // Save dispatcher and use it to send messages
                }}
            />
        </div>
    );
};
```

## Agents

GoodData Cloud's current assistant is the [Agentic AI Assistant](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/); the earlier chat
assistant is deprecated. The component reads your workspace settings and shows what your organization has turned
on, for example several conversations per user and suggested follow-up questions.

An *agent* is one configuration of the assistant: how it communicates, which skills it can use, whether it can
use AI Knowledge, and which user groups get it. Organization administrators create agents in
[AI Hub](https://www.gooddata.ai/docs/cloud/ai/ai-hub/); see [Agents](https://www.gooddata.ai/docs/cloud/ai/agents/). The assistant's skills, such as Key Driver Analysis,
forecasting, anomaly detection, and alerts, are listed in [Agentic Capabilities](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/agentic-capabilities/).

When a user has access to more than one agent, the component shows an agent chooser, so they can
[switch agents](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/agent-switcher/) in a conversation. You can
[customize the chooser](../customize-ai-assistant/#replace-the-agent-chooser), switch the agent from your code with the
[`setSelectedAgentAction`](#available-actions) action, and follow changes with `ChatAgentChangeEvent`.

## Interaction Intelligence

Interaction Intelligence shows how the assistant arrived at an answer: a timeline of the processing steps behind
one response, grouped into categories you can open for details. When it's on, each answer gets a control that
opens the panel below it.

It's off by default. Both of these must be true for it to show:

- You pass `allowInteractionIntelligence` to `GenAIAssistant` (or to `GenAiStore`).
- The `enableGenAiInteractionIntelligence` setting is on for the workspace.

```tsx
<GenAIAssistant allowInteractionIntelligence />
```

The panel is also exported as `GenAiInteractionIntelligence`, for a custom layout inside `GenAiStore`. It takes
the `responseId` of an assistant response and an `onClose` callback.

{{% alert color="warning" title="Internal prop" %}}
`allowInteractionIntelligence` is marked `@internal` in `@gooddata/sdk-ui-gen-ai`: GoodData's agent builder turns it on, and it isn't part of the public API. It may change in any release.
{{% /alert %}}

## Display mode

Use `mode` to switch the assistant between the compact `docked` layout, intended for a side panel, and the wide `fullscreen` layout, intended for a full-page section.

The assistant always fills its parent element, so `mode` does not resize it - sizing and positioning of the chrome around it stays under your control. What the property changes is the internal layout: in the `fullscreen` mode on large screens, the initial assistant experience is laid out for a wide container, with the suggested questions arranged in a row and the input centered in the available space.

The `ChatModeChangeEvent` (type `onModeChange`) is emitted whenever the display mode changes inside the assistant, so that your application can keep its own chrome in sync. That includes a dispatched `setFullscreenAction` and the expand and minimize control of the chat header when the assistant is embedded in a chat dialog.

Passing a new value through `mode` dispatches `setFullscreenAction` as well, so that change is reported too. A controlled application can still feed the reported value straight back as `mode`: the assistant dispatches only when the prop differs from the last value it applied, so the loop settles after one extra event.

Note that on small screens the fullscreen layout is always used, regardless of `mode`. This forced layout is not reported through the event, as it is not part of the mode your application controls.

For a toggle example, see [Switch between the docked and fullscreen layouts](../ai-assistant-layout/#switch-between-the-docked-and-fullscreen-layouts).

## Events

Pass event handlers in the `eventHandlers` prop of `GenAIAssistant`, `GenAIConversations`, or `GenAiStore`. Each handler complies with this interface:

```ts
export interface ChatEventHandler<TEvent extends ChatEvent = any> {
    /**
     * A guard for a specific event type.
     */
    eval: (event: ChatEvent) => event is TEvent;
    /**
     * Event handler.
     */
    handler: (event: TEvent) => void;
}
```

`@gooddata/sdk-ui-gen-ai` exports a guard for every event the chat UI emits:

| Event name | Guard name | Description |
|------------|------------|-------------|
| `ChatOpenedEvent` | `isChatOpenedEvent` | Chat window was opened |
| `ChatClosedEvent` | `isChatClosedEvent` | Chat window was closed |
| `ChatResetEvent` | `isChatResetEvent` | Chat history was reset |
| `ChatUserMessageEvent` | `isChatUserMessageEvent` | User sent a message |
| `ChatAssistantMessageEvent` | `isChatAssistantMessageEvent` | Assistant responded with a message |
| `ChatFeedbackEvent` | `isChatFeedbackEvent` | User gave a feedback |
| `ChatFeedbackErrorEvent` | `isChatFeedbackErrorEvent` | Saving the feedback failed |
| `ChatVisualizationErrorEvent` | `isChatVisualizationErrorEvent` | Visualization failed to render |
| `ChatSaveVisualizationErrorEvent` | `isChatSaveVisualizationErrorEvent` | Chat failed to save visualization |
| `ChatSaveVisualizationSuccessEvent` | `isChatSaveVisualizationSuccessEvent` | Chat successfully saved visualization |
| `ChatCopyToClipboardEvent` | `isChatCopyToClipboardEvent` | Chat copy to clipboard event |
| `ChatConversationPinnedEvent` | `isChatConversationPinnedEvent` | Conversation pinned state changed |
| `ChatConversationPinErrorEvent` | `isChatConversationPinErrorEvent` | Conversation pin/unpin failed |
| `ChatConversationDeleteEvent` | `isChatConversationDeleteEvent` | Conversation delete requested |
| `ChatConversationDeletedSuccessEvent` | `isChatConversationDeletedSuccessEvent` | Conversation deleted successfully |
| `ChatConversationDeletedErrorEvent` | `isChatConversationDeletedErrorEvent` | Conversation delete failed |
| `ChatConversationRenameEvent` | `isChatConversationRenameEvent` | Conversation rename requested |
| `ChatConversationRenamedSuccessEvent` | `isChatConversationRenamedSuccessEvent` | Conversation renamed successfully |
| `ChatConversationRenamedErrorEvent` | `isChatConversationRenamedErrorEvent` | Conversation rename failed |
| `ChatConversationChangedEvent` | `isChatConversationChangedEvent` | Active conversation changed |
| `ChatModeChangeEvent` | `isChatModeChangeEvent` | Assistant display mode changed |
| `ChatAgentChangeEvent` | `isChatAgentChangeEvent` | Assistant agent changed |
| `ChatContextChangeEvent` | `isChatContextChangeEvent` | Assistant context changed |
| `ChatDefinitionReceivedEvent` | `isChatDefinitionReceivedEvent` | Dashboard or visualization definition received |
| `ChatClarificationQuestionsEvent` | `isChatClarificationQuestionsEvent` | Clarification questions presented or resolved |
| `ChatUserAnswersEvent` | `isChatUserAnswersEvent` | User submitted clarification answers |

The sections below describe the events with extra properties.

### ChatAssistantMessageEvent

This event is triggered when the assistant completes a response. If the response activates any skills, the optional `skills` property holds their identifiers and display titles.

| Property      | Type                                          | Description                                     |
| ------------- | --------------------------------------------- | ----------------------------------------------- |
| type          | `chatAssistantMessage`                        | Event type identifier.                          |
| interactionId | `string`                                      | (Optional) The ID of the assistant interaction. |
| threadId      | `string`                                      | (Optional) The ID of the conversation thread.   |
| useCase       | `string`                                      | The routing use case for the response.          |
| skills        | `{ name: AgentCustomSkill; title: string }[]` | (Optional) Skills activated for the response.   |

### ChatDefinitionReceivedEvent

This event is triggered immediately when a message with a visualization or dashboard definition is received from history or from a stream.

| Property       | Type                           | Description                              |
| -------------- | ------------------------------ | ---------------------------------------- |
| type           | `onDefinitionReceived`         | Event type identifier.                   |
| definitionType | "dashboard" \| "visualization" | The type of the received definition.     |
| itemId         | string                         | The ID of the received item.             |
| conversationId | string                         | The ID of the conversation.              |
| interactionId  | string                         | (Optional) The ID of the interaction.    |
| dashboard      | IDashboard                     | (Optional) The dashboard definition.     |
| insights       | IInsight[]                     | (Optional) The visualizations placed on the received dashboard. |
| visualization  | IInsight                       | (Optional) The visualization definition. |

Example usage:

```tsx
<GenAIAssistant
    eventHandlers={[
        {
            eval: isChatDefinitionReceivedEvent,
            handler: (event: ChatDefinitionReceivedEvent) => {
                console.log(`Received ${event.definitionType} definition:`, event.itemId);
                if (event.definitionType === "dashboard") {
                    // handle dashboard definition
                    console.log(event.dashboard);
                }
            },
        },
    ]}
/>
```

### ChatClarificationQuestionsEvent

This event is triggered when the assistant presents clarification questions, and again when the user submits answers or cancels the questions by sending another message.

| Property      | Type                             | Description                                                  |
| ------------- | -------------------------------- | ------------------------------------------------------------ |
| type          | `chatClarificationQuestions`     | Event type identifier.                                       |
| interactionId | `string`                         | ID of the assistant interaction that contains the questions. |
| threadId      | `string`                         | (Optional) ID of the conversation thread.                    |
| questions     | `ChatClarificationQuestion[]`    | Questions with their single-choice options.                  |
| responses     | `Record<string, string> \| null` | (Optional) Answers for the current clarification state.      |

Use `responses` to tell the stages of the clarification flow apart:

- `undefined`: the questions were received and presented, and the user has not responded yet.
- An object: the user submitted the form. A non-empty object holds the answered questions; omitted questions were skipped. An empty object means the user submitted the form and skipped every question.
- `null`: the user skipped the form entirely, for example by sending another message.

Example usage:

```tsx
<GenAIAssistant
    eventHandlers={[
        {
            eval: isChatClarificationQuestionsEvent,
            handler: (event: ChatClarificationQuestionsEvent) => {
                if (event.responses === undefined) {
                    console.log("Clarification questions presented:", event.questions);
                } else if (event.responses === null) {
                    console.log("Clarification questions cancelled");
                } else {
                    console.log("Clarification answers submitted:", event.responses);
                }
            },
        },
    ]}
/>
```

### ChatUserAnswersEvent

This event is triggered when the user submits answers to clarification questions. The `answers` array holds only the answered questions: skipped questions are left out, and the array is empty if the user skips every question.

Clarification answer turns emit `chatUserAnswers` instead of `chatUserMessage`. To count all user turns, handle both event types.

| Property      | Type                        | Description                                                            |
| ------------- | --------------------------- | ---------------------------------------------------------------------- |
| type          | `chatUserAnswers`           | Event type identifier.                                                 |
| threadId      | `string`                    | (Optional) ID of the conversation thread.                              |
| interactionId | `string`                    | ID of the clarification questions interaction these answers belong to. |
| answers       | `ChatClarificationAnswer[]` | Structured answers in the order defined by `questionIndex`.            |

Each `ChatClarificationAnswer` holds the question and the selected option:

| Property           | Type           | Description                                    |
| ------------------ | -------------- | ---------------------------------------------- |
| questionIndex      | `number`       | Zero-based index of the question.              |
| questionText       | `string`       | Question text as presented to the user.        |
| answer.type        | `singleChoice` | Answer type identifier.                        |
| answer.optionIndex | `number`       | Zero-based index of the selected option.       |
| answer.optionText  | `string`       | Selected option text as presented to the user. |

Example usage:

```tsx
<GenAIAssistant
    eventHandlers={[
        {
            eval: isChatUserAnswersEvent,
            handler: (event: ChatUserAnswersEvent) => {
                console.log("Clarification interaction:", event.interactionId);
                event.answers.forEach(({ questionText, answer }) => {
                    console.log(`${questionText}: ${answer.optionText}`);
                });
            },
        },
    ]}
/>
```

### ChatModeChangeEvent

This event is triggered whenever the assistant display mode changes, for example between `"docked"` and `"fullscreen"`.

| Property | Type                 | Description            |
| -------- | -------------------- | ---------------------- |
| type     | `onModeChange`       | Event type identifier. |
| mode     | `GenAIAssistantMode` | The new display mode.  |

Example usage:

```tsx
<GenAIAssistant
    eventHandlers={[
        {
            eval: isChatModeChangeEvent,
            handler: (event: ChatModeChangeEvent) => {
                console.log(`New assistant mode: ${event.mode}`);
            },
        },
    ]}
/>
```

### ChatAgentChangeEvent

This event is triggered whenever the assistant agent changes. Its type string is `onSelectedAgentAction`.

| Property        | Type                    | Description                              |
| --------------- | ----------------------- | ---------------------------------------- |
| type            | `onSelectedAgentAction` | Event type identifier.                   |
| previousAgentId | `string`                | (Optional) The ID of the previous agent. |
| agentId         | `string`                | (Optional) The ID of the new agent.      |

Example usage:

```tsx
<GenAIAssistant
    eventHandlers={[
        {
            eval: isChatAgentChangeEvent,
            handler: (event: ChatAgentChangeEvent) => {
                console.log(`Agent changed from ${event.previousAgentId} to ${event.agentId}`);
            },
        },
    ]}
/>
```

### ChatContextChangeEvent

This event is triggered whenever the assistant context is changed.

| Property           | Type                  | Description                                                 |
| ------------------ | --------------------- | ----------------------------------------------------------- |
| type               | `onContextChange`     | Event type identifier.                                      |
| contextType        | `"ambient" \| "user"` | The type of context that was changed.                       |
| userContext        | `IGenAIUserContext`   | (Optional) The user context that was set.                   |
| replaceUserContext | `boolean`             | (Optional) Whether the user context was replaced or merged. |

Example usage:

```tsx
<GenAIAssistant
    eventHandlers={[
        {
            eval: isChatContextChangeEvent,
            handler: (event: ChatContextChangeEvent) => {
                console.log(`Context changed: ${event.contextType}`);
            },
        },
    ]}
/>
```

## Link clicks

`onLinkClick` handles clicks on the catalog items that the chat mentions. Without it, the items are rendered as plain text. The handler receives a `LinkHandlerEvent` with these properties:

| Property            | Type                                      | Description                                                                                            |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| type                | "setting" \| "report" \| GenAIObjectType  | Type of the object the user clicked on. For example, "dashboard", "metric" etc.                        |
| id                  | string                                    | The ID of the metadata object                                                                          |
| workspaceId         | string                                    | The ID of the workspace the object belongs to                                                          |
| itemUrl             | string                                    | The URL of the metadata object, if opened in GoodData Web interface                                    |
| newTab              | boolean                                   | Whether the link should be opened in a new tab                                                         |
| action              | "open" \| "copy"                          | Whether the user wants to open the object or copy its link                                             |
| preventDefault      | () => void                                | Prevent default behavior of the link click                                                             |
| section             | "ai"                                      | (Optional) The settings section to open, for `type: "setting"`                                         |
| dashboard           | IDashboard                                | (Optional) The dashboard definition, if the clicked item is a dashboard.                               |
| dashboardStatus     | "saved" \| "draft"                        | (Optional) Whether the dashboard is already saved or still a draft generated in the chat.              |
| insights            | IInsight[]                                | (Optional) The visualizations placed on the dashboard, if the clicked item is a dashboard.             |
| visualization       | IInsight                                  | (Optional) The visualization definition, if the clicked item is a visualization.                       |
| visualizationStatus | "saved" \| "draft"                        | (Optional) Whether the visualization is already saved or still a draft generated in the chat.          |

For `action: "copy"`, return the URL that should be copied to the clipboard; if the handler returns `undefined`, nothing is copied. For `action: "open"`, the return value is ignored.

{{% alert color="warning" title="Note" %}}
If `allowNativeLinks` is set to `false` (default), you must implement the `onLinkClick` handler to handle
the links in chat messages. Otherwise, the links will not be clickable and do not have any effect.
{{% /alert %}}

{{% alert color="warning" title="Dashboard skill" %}}
If you activate the dashboard skill, you must handle `onLinkClick` events with `type: "dashboard"` and
`action: "open"`. Activating the dashboard skill without this handling is not supported, even if the dashboard open
button is hidden or disabled.
{{% /alert %}}

Route saved dashboards by their URL and pass draft dashboards to your application's dashboard runtime. A draft is not
saved yet, so use the `dashboard` definition and its `insights` instead of loading it by `id` or `itemUrl`:

```tsx
import { GenAIAssistant, type LinkHandlerEvent } from "@gooddata/sdk-ui-gen-ai";

const handleLinkClick = (event: LinkHandlerEvent): string | undefined => {
    if (event.type !== "dashboard" || event.action !== "open") {
        return event.itemUrl;
    }

    event.preventDefault();

    if (event.dashboardStatus === "draft") {
        if (event.dashboard) {
            openDraftDashboard({ dashboard: event.dashboard, insights: event.insights ?? [] });
        }
        return undefined;
    }

    if (event.newTab) {
        window.open(event.itemUrl, "_blank", "noopener,noreferrer");
    } else {
        navigate(event.itemUrl);
    }
    return undefined;
};

<GenAIAssistant onLinkClick={handleLinkClick} />;
```

`navigate` stands for your application's router and `openDraftDashboard` for your dashboard runtime, which must
initialize the dashboard from both the `dashboard` and its `insights`.

## Key Driver Analysis component

`GenAiKeyDriverAnalysis` is a dialog that runs [Key Driver Analysis](../key-driver-analysis/) ("Explain" on a chart)
on visualizations the assistant generates. When a user asks to explain a data point in the chat, the request goes to
the shared store, and the dialog mounted under that store opens with the analysis.

Mount it next to `GenAIAssistant` inside a shared `GenAiStore`:

```tsx
import { GenAiStore, GenAIAssistant, GenAiKeyDriverAnalysis } from "@gooddata/sdk-ui-gen-ai";

import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const App = () => (
    <GenAiStore>
        <div style={{ width: 500, height: 600, display: "flex" }}>
            <GenAIAssistant />
        </div>
        <GenAiKeyDriverAnalysis />
    </GenAiStore>
);
```


Explain actions on charts are available when `GenAiKeyDriverAnalysis` is mounted under the active `GenAiStore`;
without it, they are disabled. To turn them on or off explicitly, set `enableKeyDriverAnalysis` on the
`ConversationVisualizationContent` or `ConversationKdaContent` slot (see
[Customize message content](../customize-ai-assistant/#customize-message-content)).

## Slots

Customize parts of the assistant UI by passing components in the `slots` prop of `GenAIAssistant` or `GenAIConversations`. Each slot component receives the `Default` component and its `defaultProps`, so you can wrap the default rendering or replace it. [Customize the AI Assistant](../customize-ai-assistant/) shows an example for every slot.

{{% alert color="warning" title="Alpha API" %}}
Only the `LandingScreen`, `Disclaimer`, and `AgentItem` slots are public. All other slots, their props types, and every
`Default*` building block (including `DefaultLandingScreen`, `DefaultDisclaimer`, and `DefaultAgentItem`) are `@alpha`
in `@gooddata/sdk-ui-gen-ai` and may change or be removed without a major version bump.
{{% /alert %}}

| Slot name | Stability | Description |
| --- | --- | --- |
| `LandingScreen` | Public | Custom screen rendered before any messages are sent. |
| `Disclaimer` | Public | Custom content rendered below the chat input. |
| `AgentItem` | Public | Custom rendering for each agent in the agent chooser. |
| `AgentChooser` | Alpha | Custom rendering for the whole agent chooser component. |
| `ConversationDrawerHeader` | Alpha | Custom rendering for the conversations drawer header. |
| `ConversationHeader` | Alpha | Custom content rendered above each conversation list group. |
| `ConversationFooter` | Alpha | Custom content rendered below each conversation list group. |
| `ConversationDateGrouping` | Alpha | Custom rendering for date grouping rows in conversation history. |
| `ConversationItem` | Alpha | Custom rendering for each conversation in the history list. |
| `UserMessage` | Alpha | Custom wrapper for user messages. |
| `AssistantMessage` | Alpha | Custom wrapper for assistant messages. |
| `MessageTextContent` | Alpha | Custom rendering for text message content. |
| `MessageErrorContent` | Alpha | Custom rendering for error message content. |
| `MessageReasoningContent` | Alpha | Custom rendering for assistant reasoning content. |
| `MessageMultipartContent` | Alpha | Custom rendering for complex messages with multiple parts. |
| `ConversationVisualizationContent` | Alpha | Custom rendering for visualization parts in multipart messages, including visualization menu item visibility. |
| `VisualizationMenu` | Alpha | Custom items of the visualization menu (the `...` button on visualizations in messages). |
| `ConversationKdaContent` | Alpha | Custom rendering for Key Driver Analysis parts in multipart messages. |
| `FollowUpButtons` | Alpha | Custom wrapper for the list of follow-up buttons. |
| `Feedback` | Alpha | Custom rendering for message feedback buttons. |
| `FollowUpQuestion` | Alpha | Custom rendering for an individual follow-up question. |

## Available actions

Dispatch these actions through the store dispatcher that `onDispatcher` or `useGenAiDispatcher` gives you. [Control the AI Assistant from your code](../control-ai-assistant/) has examples.

- `clearThreadAction` - reset the chat thread
- `startNewConversationAction` - start a new conversation
- `setCurrentConversationAction` - set active conversation in the chat
- `setSelectedAgentAction` - change the assistant agent
- `setAmbientUserContextAction` - set the ambient user context
- `setUserContextAction` - set or merge the user context
- `setFullscreenAction` - switch the assistant between the docked and the fullscreen layout
- `newMessageAction` - add message to the stack and get response from the assistant
- `pinConversationAction` - pin or unpin a conversation
- `renameConversationAction` - rename an existing conversation
- `deleteConversationAction` - delete a conversation

### useGenAiDispatcher hook

You can use the `useGenAiDispatcher` hook to retrieve the dispatcher when working within the `GenAiStore` context.

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

### Conversation state hooks

These hooks read the conversations of the current `GenAiStore`. They're `@alpha` and may change without a major version bump.

- `useGenAiConversations()`: returns all conversations in the current store, or `undefined` before they are loaded.
- `useGenAiConversationsLoaded()`: returns whether the conversations have been loaded.
- `useGenAiCurrentConversation()`: returns the active conversation, if any.

See [Build your own conversation list](../ai-assistant-layout/#build-your-own-conversation-list) for an example.

## Props

`GenAIAssistantProps`, `GenAIConversationsProps`, and `GenAiStoreProps` are type aliases, which the generated Props tables don't support yet, so their props are listed by hand. The generated table at the end lists the slots (`IGenAIAssistantSlots`).

### GenAIAssistant

`GenAIAssistant` takes every [`GenAiStore` prop](#genaistore) except `children`, plus these:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `locale` | `string` | `"en-US"` | The locale of the chat UI. |
| `onLinkClick` | `(event: LinkHandlerEvent) => string \| undefined` | - | Handles clicks on the catalog items mentioned in the chat. Without it, the items are plain text. See [Link clicks](#link-clicks). |
| `allowNativeLinks` | `boolean` | `false` | Renders catalog items as native `<a>` links to the GoodData web interface. `onLinkClick` fires in both cases. |
| `disableManage` | `boolean` | `false` | Turns off the manage permission for the user even if the user has it. |
| `disableAnalyze` | `boolean` | `false` | Turns off the analyze permission for the user even if the user has it. |
| `disableFullControl` | `boolean` | `false` | Turns off the full control permission for the user even if the user has it. |
| `dashboardSelector` | `DashboardSelectorEvaluator \| null` | - | Builds the ambient context of the chat from a dashboard. Pass `null` to clear a previously derived dashboard context. See [Connect the assistant to a dashboard](../ai-assistant-layout/#connect-the-assistant-to-a-dashboard). |
| `slots` | `IGenAIAssistantSlots` | - | Customizations of the assistant UI. See [Slots](#slots). |
| `className` | `string` | - | Additional class name applied to the root element. |
| `mode` | `GenAIAssistantMode` | `"docked"` | Layout of the assistant, `"docked"` or `"fullscreen"`. See [Display mode](#display-mode). |
| `onModeChange` | `(mode: GenAIAssistantMode) => void` | - | Called when the display mode changes on its own, for example after `setFullscreenAction` is dispatched. |

### GenAIConversations

`GenAIConversations` takes every [`GenAiStore` prop](#genaistore) except `children`, plus these:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `locale` | `string` | `"en-US"` | The locale of the conversations UI. |
| `onConversationSelect` | `(conversation: IChatConversationLocal) => void` | - | Called after the user selects a conversation. The selection is already applied to the store. |
| `slots` | `IGenAIAssistantSlots` | - | Customizations of the conversation history UI. See [Customize conversation history](../customize-ai-assistant/#customize-conversation-history). |
| `className` | `string` | - | Additional class name applied to the root element. |

### GenAiStore

| Name | Type | Description |
| --- | --- | --- |
| `backend` | `IAnalyticalBackend` | Backend instance. Falls back to the `BackendProvider` context. |
| `workspace` | `string` | Workspace ID. Falls back to the `WorkspaceProvider` context. |
| `colorPalette` | `IColorPalette` | Color palette for the visualizations in the chat. |
| `catalogItems` | `CatalogItem[]` | Catalog items for autocompletion. Loaded lazily when not provided. |
| `dashboards` | `IListedDashboard[]` | Dashboards offered by the context chooser. When provided, the list is taken as complete and no dashboards are loaded from the backend. |
| `visualizations` | `IInsight[]` | Visualizations offered by the context chooser. When provided, the list is taken as complete and no visualizations are loaded from the backend. |
| `settings` | `IUserWorkspaceSettings` | Workspace settings for the chat UI. |
| `eventHandlers` | `ChatEventHandler[]` | Handlers of the events that the child components emit. See [Events](#events). |
| `onLinkClick` | `(event: LinkHandlerEvent) => string \| undefined` | Handles clicks on the catalog items mentioned in the chat, for all child components. |
| `allowNativeLinks` | `boolean` | Renders catalog items as native `<a>` links to the GoodData web interface. Defaults to `false`. |
| `objectTypes` | `GenAIObjectType[]` | Restricts the object types the assistant searches and suggests. |
| `includeTags` | `string[]` | Includes only metadata objects with these tags. |
| `excludeTags` | `string[]` | Excludes metadata objects with these tags. |
| `mode` | `GenAIAssistantMode` | Layout of the assistant, `"docked"` or `"fullscreen"`. |
| `displayMode` | `GenAIAssistantDisplayMode` | Display mode of the assistant. |
| `providedStore` | `Promise<Store>` | A store to use instead of creating a new one. |
| `onDispatcher` | `(dispatch: EnhancedStore["dispatch"]) => void` | Called with the store dispatcher after the store is initialized. |
| `children` | `ReactNode \| ((genAIStore: EnhancedStore) => ReactNode)` | Components or a render function wrapped by the shared store. |

### IGenAIAssistantSlots

{{% props %}}
