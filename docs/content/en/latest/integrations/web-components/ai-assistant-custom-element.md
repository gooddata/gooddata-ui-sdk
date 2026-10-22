---
legacy_path: learn/web_components/ai_assistant_custom_element
title: AI Assistant custom element
category: Integrations / Web Components
diataxis_type: reference
source_files:
  - src/index.ts
  - src/gen-ai/GenAiAssistant.tsx
  - src/gen-ai/GenAiConversations.tsx
  - src/gen-ai/GenAiProvider.tsx
  - src/gen-ai/common.ts
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/web-components/web-components-auth
  - /docs/integrations/framework-integrations/vue-integration
  - /docs/integrations/framework-integrations/angular-integration
description: Embed the AI Assistant with gd-ai-assistant, set its workspace and locale, subscribe to its chat events, and compose the chat from several elements.
ai_generated_description: true
type: docs
weight: 84
section: Integrations
subsection: Web Components
aliases:
  - "../../learn/web_components/ai_assistant_custom_element/"
---

`gd-ai-assistant` embeds the GoodData AI Assistant. It renders the [`GenAIAssistant`](../../../ai-modules/ai-assistant/) component:

```html
<!-- minimal setup -->
<gd-ai-assistant></gd-ai-assistant>
```

## Supported attributes

```html
<!-- all supported attributes -->
<gd-ai-assistant workspace="my-workspace-id" locale="en-US" objectTypes='["dashboard","visualization"]'></gd-ai-assistant>
```

-   `workspace` - optional, the ID of the workspace for this AI Assistant. By default, it's taken from the context, for example from the script URL.
-   `locale` - optional, defaults to `en-US`. The localization of the AI Assistant interface. For all available languages, see [the full list of available localizations][1].
-   `objectTypes` - optional, a JSON array of metadata object types that the assistant searches and suggests, for example `'["dashboard","visualization"]'`. Valid values are `dataset`, `attribute`, `label`, `fact`, `date`, `metric`, `visualization`, and `dashboard` (see `GenAIObjectType`). If omitted, the assistant uses its default set of object types.

You can also set the workspace ID once on the context instead of passing it to every element. See the code example in [Web Components authentication][2].

{{% alert color="info" %}}
The locale affects only the UI elements, not your data or the metadata language.
{{% /alert %}}

## Supported events

`gd-ai-assistant` emits `linkClick` and forwards every chat event of the `GenAIAssistant` component (see `ChatEvent`) as a DOM event named after the event type. The most common ones are:

-   `linkClick` - when a user clicks on a link in the chat.
-   `chatOpened` / `chatClosed` - when the chat is opened or closed.
-   `chatReset` - when the chat is reset.
-   `chatUserMessage` - when a user message is added to the chat.
-   `chatAssistantMessage` - when an assistant message is added to the chat.
-   `chatFeedback` - when a user provides feedback on the assistant message.
-   `chatVisualizationError` - when an error occurs while rendering the visualization in the chat.
-   `chatSaveVisualizationSuccess` / `chatSaveVisualizationError` - when saving a visualization from the chat succeeds or fails.
-   `chatCopyToClipboard` - when a user copies content to the clipboard.

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

## Compose the chat from several elements

The library registers three more elements that share the AI Assistant's code:

| Element | Renders | Use it to |
| --- | --- | --- |
| `gd-ai-chat` | The same `GenAIAssistant` component as `gd-ai-assistant` | Alias of `gd-ai-assistant`; the two tags behave identically. |
| `gd-ai-conversations` | The `GenAIConversations` component: the list of the user's conversations | Show the conversation list separately from the chat. Selecting a conversation makes it the current one in the shared store. |
| `gd-ai-provider` | Nothing visible; it owns the chat store | Make the `gd-ai-assistant`, `gd-ai-chat`, and `gd-ai-conversations` elements placed inside it share one conversation state. |

`gd-ai-chat` and `gd-ai-conversations` support the same `workspace`, `locale`, and `objectTypes` attributes as `gd-ai-assistant` and emit the same events.

### Share one store with `gd-ai-provider`

Wrap the chat and the conversation list in `gd-ai-provider`. When the provider connects and the shared context is available, it creates the chat store, and every `gd-ai-assistant`, `gd-ai-chat`, or `gd-ai-conversations` element inside it connects to that store instead of creating its own:

```html
<gd-ai-provider workspace="my-workspace-id">
    <aside><gd-ai-conversations></gd-ai-conversations></aside>
    <main><gd-ai-assistant></gd-ai-assistant></main>
</gd-ai-provider>
```

| Attribute | Description |
| --- | --- |
| `workspace`, `locale`, `objectTypes` | Applied to the shared store. Same values as on `gd-ai-assistant`. |
| `store` | Optional ID of the store. The provider generates one when the attribute is absent. Child elements look up the nearest ancestor with a `store` attribute, so the provider doesn't have to be their direct parent. |

The provider reads its attributes once, when it connects; changing them later has no effect. The provider itself dispatches no DOM events; listen on the `gd-ai-assistant` and `gd-ai-conversations` elements.

### JavaScript properties and methods

`gd-ai-assistant`, `gd-ai-chat`, `gd-ai-conversations`, and `gd-ai-provider` expose these JavaScript properties. Assign them after the element is defined, for example after `await customElements.whenDefined("gd-ai-provider")`.

| Property or method | Description |
| --- | --- |
| `onLinkClick` | Callback invoked when the user clicks a link in the chat, with a `CustomEvent` whose `detail` is the `linkClick` payload described below. The element always suppresses the chat's own navigation and dispatches the `linkClick` event before it calls the callback. |
| `onDispatcher` | Callback that receives the store's `dispatch` function once the store exists. Use it to dispatch the actions exported by `@gooddata/sdk-ui-gen-ai`. |
| `startNewConversationAction()` | Dispatches the start-new-conversation action to the store. The method is attached asynchronously after the element connects, so guard early calls with `?.`. |

On `gd-ai-provider`, assigning `onLinkClick` or `onDispatcher` forwards the callback to the shared store, and `startNewConversationAction()` acts on the shared store.

```html
<gd-ai-provider id="provider" workspace="my-workspace-id">
    <gd-ai-conversations></gd-ai-conversations>
    <gd-ai-assistant></gd-ai-assistant>
</gd-ai-provider>
<button id="new-conversation">New conversation</button>
<script type="module">
    await customElements.whenDefined("gd-ai-provider");
    const providerEl = document.getElementById("provider");

    providerEl.onLinkClick = (event) => {
        console.log("link clicked", event.detail.itemUrl);
    };

    document.getElementById("new-conversation").addEventListener("click", () => {
        providerEl.startNewConversationAction?.();
    });
</script>
```

The `linkClick` event `detail` carries `type` (the linked object type, `"setting"`, or `"report"`), `id`, `workspaceId`, `itemUrl`, `newTab`, and `action` (`"open"` or `"copy"`), and, depending on the link, `section`, `dashboard`, `insights`, `dashboardStatus`, `visualization`, and `visualizationStatus`.

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-model/src/base/localization.ts
[2]: ../web-components-auth/
