---
title: AI Assistant
linkTitle: AI Assistant
copyright: (C) 2025 GoodData Corporation
id: embed_ai_assistant
no_list: true
weight: 71
---

GoodData.UI provides a React component for embedding of the chat interface for [AI Assistant].

![AI Assistant](gd-ui/ai-assistant.png)

## Prerequisites

Before you can use the AI Assistant, you need to make sure it is properly set up in GoodData Cloud. For detailed instructions, see [Configure AI Assistant](https://www.gooddata.com/docs/cloud/ai/use-ai_assistant/configure-ai-assistant/).

If you are using GoodData.CN, some additional configuration may be required. For details, see the [AI in GoodData.CN](https://www.gooddata.com/docs/cloud/ai/use-ai_assistant/configure-ai-assistant/#ai-in-gooddatacn) section of the article.

## Features

- Embed UI for the AI Assistant chat.
- Subscribe to chat events.
- Handle links in chat messages.
- Theming is supported out of the box through [Theme Provider].

## Basic integration example

`GenAIAssistant` component renders chat history and an input field for sending user messages.
It does not include the logic for overlay management in case you want to render it in a floating window.

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
                    // E.g. when user asks the chatbot to find
                    // a specific dashboard and clicks on the result
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

### Props

| Name               | Type                                          | Default | Description                                                                                                          |
| ------------------ | --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| locale             | ILocale                                       | "en-US" | Specifies the locale for internationalization                                                                        |
| backend            | IAnalyticalBackend                            | -       | Backend instance. Falls back to BackendProvider context if not specified                                             |
| workspace          | string                                        | -       | Workspace ID. Falls back to WorkspaceProvider context if not specified                                               |
| colorPalette       | IColorPalette                                 | -       | Color palette used for rendering the visualizations. If not provided, the default color palette will be used         |
| catalogItems       | CatalogItem[]                                 | -       | Catalog items used for autocompletion. If not provided - will be lazy-loaded when needed                             |
| eventHandlers      | ChatEventHandler[]                            | -       | Event handlers for user interactions with the chat UI                                                                |
| onLinkClick        | (LinkHandlerEvent) => void                    | -       | Handle user clicks on the catalog items mentioned in chat.                                                           |
| allowNativeLinks   | boolean                                       | false   | Whether to allow native links in chat messages. If false, `onLinkClick` handler will be fired when clicking on links |
| disableManage      | boolean                                       | false   | This will disable manage permissions for the user even if the user has them defined.                                 |
| disableAnalyze     | boolean                                       | false   | This will disable analyze permissions for the user even if the user has them defined.                                |
| disableFullControl | boolean                                       | false   | This will disable full control permissions for the user even if the user has them defined.                           |
| onDispatcher       | (dispatch: (action: unknown) => void) => void | -       | Dispatcher for sending messages in the chat.                                                                         |

#### eventHandlers

Each event handler must comply with the following interface:

```tsx
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

`@gooddata/sdk-ui-gen-ai` provides a set of guards for all the events that can be emitted by the chat UI.

Here is a list of the relevant events:

| Event name                          | Guard name                            | Description                           |
| ----------------------------------- | ------------------------------------- | ------------------------------------- |
| `ChatResetEvent`                    | `isChatResetEvent`                    | Chat history was reset                |
| `ChatUserMessageEvent`              | `isChatUserMessageEvent`              | User sent a message                   |
| `ChatAssistantMessageEvent`         | `isChatAssistantMessageEvent`         | Assistant responded with a message    |
| `ChatFeedbackEvent`                 | `isChatFeedbackEvent`                 | User gave a feedback                  |
| `ChatVisualizationErrorEvent`       | `isChatVisualizationErrorEvent`       | Visualization failed to render        |
| `ChatSaveVisualizationErrorEvent`   | `isChatSaveVisualizationErrorEvent`   | Chat failed to saved visualisation    |
| `ChatSaveVisualizationSuccessEvent` | `isChatSaveVisualizationSuccessEvent` | Chat successfully saved visualisation |
| `ChatCopyToClipboardEvent`          | `isChatCopyToClipboardEvent`          | Chat copy to clipboard event          |

#### onLinkClick

Handle user clicks on the catalog items mentioned in chat. If not provided, catalog items will be rendered as plain text.
Each event contains the following properties:

| Property       | Type       | Description                                                                              |
| -------------- | ---------- | ---------------------------------------------------------------------------------------- |
| type           | string     | Type of the metadata object the user clicked on. For example, "dashboard", "metric" etc. |
| id             | string     | The ID of the metadata object                                                            |
| itemUrl        | string     | The URL of the metadata object, if opened in GoodData Web interface                      |
| newTab         | boolean    | Whether the link should be opened in a new tab                                           |
| preventDefault | () => void | Prevent default behavior of the link click                                               |

> Note: If `allowNativeLinks` is set to `false` or keep default, in must be implemented `onLinkClick` handler to handle
> the links in chat messages. Otherwise, the links will not be clickable and do not have any effect.

## Resetting the chat thread

To reset the chat thread, use the `reset` method on the ChatThread interface.

```tsx
const chatThread = backend.workspace(workspaceId).genAI().getChatThread();

await chatThread.reset();
```

or dispatch clear thread action by using dispatcher

```typescript jsx
import { clearThreadAction } from "@gooddata/sdk-ui-gen-ai";

// Retreve dispatcher from chat UI
dispatcher(clearThreadAction());
```

## Actions that are now available

- `clearThreadAction` - reset the chat thread
- `newMessageAction` - add message to the stack and get response from the assistant

### Example usage:

```tsx
import {
    clearThreadAction,
    newMessageAction,
    makeUserMessage,
    makeTextContents,
} from "@gooddata/sdk-ui-gen-ai";

// Retreve dispatcher from chat UI
dispatcher(clearThreadAction());
dispatcher(newMessageAction(makeUserMessage([makeTextContents("Hello", [])])));
```

[ai assistant]: https://www.gooddata.com/platform/artificial-intelligence/
[theme provider]: ../../learn/apply_theming/
