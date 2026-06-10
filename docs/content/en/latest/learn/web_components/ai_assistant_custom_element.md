---
title: AI Assistant custom element
sidebar_label: AI Assistant custom element
copyright: (C) 2007-2025 GoodData Corporation
id: webcomponents_ai_assistant
---

You can embed the GoodData AI Assistant into your application using the `gd-ai-assistant` custom element with the following:

```html
<!-- minimal setup -->
<gd-ai-assistant></gd-ai-assistant>
```

## Supported attributes

```html
<!-- all supported attributes -->
<gd-ai-assistant workspace="my-workspace-id" locale="en-US" objectTypes="dashboard,insight"></gd-ai-assistant>
```

- `workspace` - optional, the ID of the workspace for this AI Assistant. By default, it is taken from the context (e.g., from the script URL).
- `locale` - optional, defaults to `en-US`. The localization of the AI Assistant interface. For all available languages, see [the full list of available localizations][1].
- `objectTypes` - optional, comma-separated list of metadata object types available to assistant search and suggestions.

You can also provide a workspace id on the context level instead of passing it as an attribute to every AI Assistant component. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported properties and methods

`gd-ai-assistant` supports these JavaScript properties:

- `onLinkClick` - callback called when a link in chat is clicked.
- `onDispatcher` - callback that receives the internal dispatcher function.

`gd-ai-assistant` also exposes this method:

- `startNewConversationAction()` - dispatches the action to start a new conversation.

Assign properties after the custom element is upgraded:

```html
<gd-ai-assistant id="some-dom-id"></gd-ai-assistant>
<script type="module">
    await customElements.whenDefined("gd-ai-assistant");

    const chatEl = document.getElementById("some-dom-id");

    chatEl.onDispatcher = (dispatch) => {
        // save dispatcher for advanced integrations if needed
        window.chatDispatch = dispatch;
    };

    document.getElementById("start-new-conversation")?.addEventListener("click", () => {
        chatEl.startNewConversationAction?.();
    });
</script>
```

`onDispatcher` is a property callback, not an HTML attribute.

## Supported events

`gd-ai-assistant` emits the following events:

- `linkClick` - when a user clicks on a link in the chat.
- `chatReset` - when the chat is reset.
- `chatOpened` - when the chat is opened.
- `chatClosed` - when the chat is closed.
- `chatUserMessage` - when a user message is added to the chat.
- `chatAssistantMessage` - when an assistant message is added to the chat.
- `chatFeedback` - when a user provides feedback on the assistant message.
- `chatFeedbackError` - when feedback submission fails.
- `chatVisualizationError` - when an error occurs while rendering the visualization in the chat.
- `chatSaveVisualizationError` - when saving a visualization fails.
- `chatSaveVisualizationSuccess` - when a visualization is saved successfully.
- `chatCopyToClipboard` - when a user copies content to clipboard.
- `chatConversationPinned` - when a conversation is pinned.
- `chatConversationPinError` - when pinning a conversation fails.
- `chatConversationDelete` - when a user requests conversation deletion.
- `chatConversationDeletedSuccess` - when conversation deletion succeeds.
- `chatConversationDeletedError` - when conversation deletion fails.
- `chatConversationRename` - when a user requests conversation rename.
- `chatConversationRenamedSuccess` - when conversation rename succeeds.
- `chatConversationRenamedError` - when conversation rename fails.
- `chatConversationChanged` - when current conversation changes.

Events **do not bubble** and **are not cancelable**. Here is how you can subscribe to one from your code:

```html
<gd-ai-assistant id="some-dom-id"></gd-ai-assistant>
<script>
    const chatEl = document.getElementById("some-dom-id");
    chatEl.addEventListener("linkClick", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });
</script>
```

## `gd-ai-conversations` custom element

You can embed only the conversations list/panel using the `gd-ai-conversations` custom element:

```html
<gd-ai-conversations
    workspace="my-workspace-id"
    locale="en-US"
    objectTypes="dashboard,insight"
></gd-ai-conversations>
```

`gd-ai-conversations` supports the same attributes, properties, and methods as `gd-ai-assistant`:

- Attributes: `workspace`, `locale`, `objectTypes`
- Properties: `onLinkClick`, `onDispatcher`
- Method: `startNewConversationAction()`

Example with safe property assignment after upgrade:

```html
<gd-ai-conversations id="conversations"></gd-ai-conversations>
<script type="module">
    await customElements.whenDefined("gd-ai-conversations");

    const conversationsEl = document.getElementById("conversations");
    conversationsEl.onDispatcher = (dispatch) => {
        window.conversationsDispatch = dispatch;
    };

    document.getElementById("start-new-conversation")?.addEventListener("click", () => {
        conversationsEl.startNewConversationAction?.();
    });
</script>
```

`gd-ai-conversations` emits the same GenAI chat events (via `event.type`) as the assistant flow, including conversation lifecycle events such as `chatConversationChanged`, `chatConversationDelete`, and related success/error events.

## `gd-ai-provider` custom element

Use `gd-ai-provider` as a composition wrapper when you render `gd-ai-conversations` and `gd-ai-assistant` together and need them to share one internal GenAI store:

```html
<gd-ai-provider workspace="my-workspace-id" locale="en-US" objectTypes="dashboard,insight">
    <div><gd-ai-conversations></gd-ai-conversations></div>
    <button id="start-new-conversation">New conversation</button>
    <div><gd-ai-assistant></gd-ai-assistant></div>
</gd-ai-provider>
```

`gd-ai-provider` supports the same attributes, properties, and method:

- Attributes: `workspace`, `locale`, `objectTypes`
- Properties: `onLinkClick`, `onDispatcher`
- Method: `startNewConversationAction()`

Example of controlling the composed experience through provider API:

```html
<gd-ai-provider id="provider">
    <div><gd-ai-conversations></gd-ai-conversations></div>
    <button id="new-conversation">New conversation</button>
    <div><gd-ai-assistant></gd-ai-assistant></div>
</gd-ai-provider>

<script type="module">
    await customElements.whenDefined("gd-ai-provider");

    const providerEl = document.getElementById("provider");

    providerEl.onDispatcher = (dispatch) => {
        // optional advanced integration hook
        window.genAiDispatch = dispatch;
    };

    document.getElementById("new-conversation")?.addEventListener("click", () => {
        providerEl.startNewConversationAction?.();
    });
</script>
```

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]: ../authentication/
