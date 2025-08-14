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
<gd-ai-assistant workspace="my-workspace-id" locale="en-US"></gd-ai-assistant>
```

-   `workspace` - optional, the ID of the workspace for this AI Assistant. By default, it is taken from the context (e.g., from the script URL).
-   `locale` - optional, defaults to `en-US`. The localization of the AI Assistant interface. For all available languages, see [the full list of available localizations][1].

You can also provide a workspace id on the context level instead of passing it as an attribute to every AI Assistant component. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported events

`gd-ai-assistant` emits the following events:

-   `linkClick` - when a user clicks on a link in the chat.
-   `chatReset` - when the chat is reset.
-   `chatUserMessage` - when a user message is added to the chat.
-   `chatAssistantMessage` - when an assistant message is added to the chat.
-   `chatFeedback` - when a user provides feedback on the assistant message.
-   `chatVisualizationError` - when an error occurs while rendering the visualization in the chat.

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

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]: ../authentication/
