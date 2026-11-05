# Gooddata GenAI SDK

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-gen-ai)](https://www.npmjs.com/@gooddata/sdk-ui-gen-ai)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-gen-ai)](https://npmcharts.com/compare/@gooddata/sdk-ui-gen-ai?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides a set of React-based UI components and hooks for GenAI chatbot and other AI-based functionality.

Example usage:

```tsx
import { GenAIAssistant } from "@gooddata/sdk-ui-gen-ai";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const App = () => {
    return <GenAIAssistant workspaceId="your-workspace-id" backend={tigerBackend} />;
};
```

## Custom input placeholder

Set `inputPlaceholder` on `GenAIAssistant` to override the chat input placeholder:

```tsx
<GenAIAssistant backend={backend} workspace="your-workspace-id" inputPlaceholder="Ask about your data…" />
```

`GenAIStandaloneInput` (available from `@gooddata/sdk-ui-gen-ai/internal`) accepts the same prop.
Custom text is displayed as-is; the embedding application is responsible for translating it.
Omitting the prop keeps the bundled localized placeholder ("Ask here…" in English).
An empty string hides the placeholder. The standalone input's existing `placeholder` prop remains
supported, with `inputPlaceholder` taking precedence when both are supplied.

## Headless copilot workflow (alpha)

`CopilotHandler` owns plain immutable workflow state; it requires no Redux setup.
Register each build type with its reacting skills, pure definition acceptance policy,
and host application callback. Create one instance per editor/runtime, not a singleton.

```typescript
import { CopilotBuildType, CopilotHandler } from "@gooddata/sdk-ui-gen-ai";

const copilot = new CopilotHandler({
    registrations: [
        {
            type: CopilotBuildType.Dashboard,
            skills: ["dashboard_builder", "dashboard_editor"],
            resolveDefinition: (event) =>
                event.definitionType === "dashboard" && event.dashboard
                    ? { type: CopilotBuildType.Dashboard, objectId: event.dashboard.identifier }
                    : undefined,
            onApplyDefinition: (event, applicationId, target) => {
                // Install in the host. Dispatching a host action is not completion.
                installDefinition(event).then(
                    () => copilot.definitionApplied(applicationId, target),
                    () => copilot.definitionApplicationInterrupted(applicationId),
                );
            },
        },
    ],
});

const unsubscribe = copilot.subscribe(() => {
    renderProgress(copilot.getStatus({ type: CopilotBuildType.Dashboard }));
});
copilot.startGeneration(CopilotBuildType.Dashboard);
// Forward each existing ChatEvent once: copilot.handleEvent(event).
// On teardown:
unsubscribe();
copilot.dispose();
```

`installDefinition` and `renderProgress` above are application functions. Pure consumers can use
`transitionCopilot` and the exported selectors directly. React consumers may subscribe with
`useCopilotSnapshot(copilot)`; the hook adds no workflow owner. Application-owned string enums
can replace the built-in `CopilotBuildType` without changing the lifecycle algorithm.

Switching conversations clears foreground reasoning, not outstanding workflow ownership.
Activated creation requests continue to contribute progress across chats; edit and builder
scopes also include their matching background requests. Unanswered clarification questions keep
waiting across conversation switches, as do creation/builder workflows awaiting a general follow-up
reply. Ordinary completed edits without pending questions still release their lock.
Replying resumes the same workflow; failure, cancellation, target reset, or definition
application acknowledgement releases it. In-progress applications stay building until acknowledgement.
Clarifications can be answered through the form or by typing in chat. A clarification event with
`responses: null` dismisses the form before a typed reply; it does not cancel the workflow or release its lock.
The originating conversation owns its loader: ordinary messages, reasoning, completion, or failure in
another chat cannot replace its progress or release its lock. Ownership transfers only when another
conversation activates a configured skill for the same workflow and target. Superseded responses cannot
reclaim ownership or restore an old wait after the new workflow finishes; other targets remain independent.

## Composing overlay (alpha)

Wrap any editor with loading, reasoning, and waiting-for-reply presentation. No dashboard
configuration or Redux store is needed. The visibility predicate controls only composing UI;
wrapped content stays mounted. It is evaluated during rendering, so rerender when its inputs change.
The wrapper fills its host and positions the overlay relative to that host.

```tsx
import { CopilotInteractionComposing } from "@gooddata/sdk-ui-gen-ai";
import "@gooddata/sdk-ui-gen-ai/styles/css/copilotInteractionComposing.css";

<CopilotInteractionComposing
    status="building"
    reasoningTitle="Arranging visualizations"
    isVisible={() => !isExporting}
    onReplyInChat={openChat}
>
    <Editor />
</CopilotInteractionComposing>;
```

Use `generating` or `building` for loading (optionally with a reasoning heading), `waiting`
for the reply banner, and `idle` for no composing UI. Supply `locale` for localized labels.
`CopilotInteractionComposingWithHandler` accepts `copilot` and `scope` instead of `status`
and `reasoningTitle` and subscribes directly to the same runtime-owned handler. Its optional
`onReplyInChat(threadId)` receives the owning waiting workflow's thread, not whichever
chat is currently selected. It does not dispose that handler when unmounted. Both variants also
ship in `styles/css/main.css`.

## License

(C) 2017-2026 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-all/LICENSE).
