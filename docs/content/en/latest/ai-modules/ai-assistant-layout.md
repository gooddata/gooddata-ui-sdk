---
title: Place and connect the AI Assistant
category: AI & Modules
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-gen-ai:GenAIAssistant"
  - "@gooddata/sdk-ui-gen-ai:GenAIConversations"
  - "@gooddata/sdk-ui-gen-ai:GenAiStore"
  - "@gooddata/sdk-ui-gen-ai:useDashboardCopilot"
  - "@gooddata/sdk-ui-gen-ai:CopilotInteractionComposingWithHandler"
source_files:
  - src/components/GenAIChat.tsx
  - src/components/GenAiConversations.tsx
  - src/components/GenAiStore.tsx
  - src/copilot/useDashboardCopilot.ts
  - src/copilot/CopilotInteractionComposingWithHandler.tsx
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/ai-modules/control-ai-assistant
  - /docs/ai-modules/customize-ai-assistant
  - /docs/dashboard-plugins/dashboard
  - /docs/ai-modules/semantic-search
description: Switch the AI Assistant between docked and fullscreen layouts, show the conversations list next to the chat, connect the assistant to a dashboard, and hand it a Semantic Search query.
ai_generated_body: true
type: docs
weight: 52
section: AI & Modules
---

Place the AI Assistant in your layout and connect it to the components around it. Every example needs the AI Assistant set up in your organization, see [Prerequisites](../ai-assistant/#prerequisites).

To change the chat input hint, see [Set the input placeholder](../customize-ai-assistant/#set-the-input-placeholder).

## Switch between the docked and fullscreen layouts

Use `mode` to switch the assistant between the compact `docked` layout, intended for a side panel, and the wide `fullscreen` layout, intended for a full-page section. `mode` changes only the internal layout; size the container yourself.

Keep the mode in state, and update it from `ChatModeChangeEvent` so that the header's expand and minimize control stays in sync with your chrome:

```tsx
import { useState } from "react";

import {
    GenAIAssistant,
    type GenAIAssistantMode,
    isChatModeChangeEvent,
    type ChatModeChangeEvent,
} from "@gooddata/sdk-ui-gen-ai";

const App = () => {
    const [mode, setMode] = useState<GenAIAssistantMode>("docked");

    return (
        <div className={mode === "fullscreen" ? "my-app-ai-page" : "my-app-ai-panel"}>
            <button onClick={() => setMode(mode === "docked" ? "fullscreen" : "docked")}>
                Toggle fullscreen
            </button>
            <GenAIAssistant
                mode={mode}
                eventHandlers={[
                    {
                        eval: isChatModeChangeEvent,
                        handler: (event: ChatModeChangeEvent) => {
                            setMode(event.mode);
                        },
                    },
                ]}
            />
        </div>
    );
};
```

When the control that toggles the mode lives outside the component tree that renders the assistant, dispatch `setFullscreenAction` through the store dispatcher instead:

```tsx
import { GenAIAssistant, setFullscreenAction } from "@gooddata/sdk-ui-gen-ai";

<GenAIAssistant
    onDispatcher={(dispatch) => {
        dispatch(setFullscreenAction({ isFullscreen: true }));
    }}
/>;
```

On small screens, the assistant always uses the fullscreen layout. [Display mode](../ai-assistant/#display-mode) describes the events in detail.

## Show the conversations list next to the chat

Render `GenAIConversations` and `GenAIAssistant` inside one `GenAiStore`. Both read the active conversation from the store, so selecting a conversation in the list switches the chat without extra wiring.

```tsx
import { GenAiStore, GenAIConversations, GenAIAssistant, startNewConversationAction } from "@gooddata/sdk-ui-gen-ai";

import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const App = () => {
    let dispatcher: (action: unknown) => void = () => undefined;

    return (
        <GenAiStore onDispatcher={(storeDispatch) => (dispatcher = storeDispatch)}>
            <GenAIConversations
                onConversationSelect={(conversation) => {
                    // The selection is already applied to the shared store;
                    // use the callback for your own side effects, for example routing
                    console.log(`Selected conversation: ${conversation.title}`);
                }}
            />
            <GenAIAssistant />
            <button onClick={() => dispatcher(startNewConversationAction())}>New conversation</button>
        </GenAiStore>
    );
};
```

### Split layout with the conversations list

This layout puts the list and the chat in separate panels, with a shared "new conversation" button between them:

```tsx
import { type CSSProperties, useState } from "react";

import {
    GenAiStore,
    GenAIConversations,
    GenAIAssistant,
    startNewConversationAction,
} from "@gooddata/sdk-ui-gen-ai";

import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

export function App() {
    const [dispatcher, setDispatcher] = useState<(action: unknown) => void>(() => {
        return (() => undefined) as (action: unknown) => void;
    });

    return (
        <GenAiStore
            onDispatcher={(storeDispatch) => {
                setDispatcher(() => storeDispatch);
            }}
        >
            <div style={getConversationsStyle()}>
                <GenAIConversations />
            </div>
            <button
                style={getButtonStyle()}
                onClick={() => {
                    dispatcher(startNewConversationAction());
                }}
            >
                NEW CONVERSATION
            </button>
            <div style={getAssistantStyle()}>
                <GenAIAssistant />
            </div>
        </GenAiStore>
    );
}

function getConversationsStyle(): CSSProperties {
    return {
        position: "absolute",
        width: "350px",
        left: "30px",
        top: "30px",
        bottom: "30px",
        border: "3px solid #ccc",
        borderRadius: "10px",
        overflow: "auto",
    };
}

function getAssistantStyle(): CSSProperties {
    return {
        position: "absolute",
        width: "500px",
        right: "30px",
        top: "30px",
        bottom: "30px",
        border: "3px solid #ccc",
        borderRadius: "10px",
        overflow: "hidden",
    };
}

function getButtonStyle(): CSSProperties {
    return {
        position: "absolute",
        right: "50%",
        top: "50%",
    };
}
```

How the integration works:

- `GenAiStore` provides a shared dispatcher and synchronized state for both components.
- `GenAIConversations` and `GenAIAssistant` read the active conversation from that store, so selecting a
  conversation in the list switches the assistant pane without extra wiring.
- The shared "new conversation" button dispatches `startNewConversationAction` once through the store dispatcher,
  keeping both panels in sync.

## Build your own conversation list

To render the list yourself, read the conversations from the store with the `@alpha` hooks `useGenAiConversations`, `useGenAiConversationsLoaded`, and `useGenAiCurrentConversation`, and switch the conversation with `setCurrentConversationAction`.

```tsx
import {
    GenAiStore,
    useGenAiConversations,
    setCurrentConversationAction,
    useGenAiDispatcher,
} from "@gooddata/sdk-ui-gen-ai";

const MyConversations = () => {
    const dispatch = useGenAiDispatcher();
    const conversations = useGenAiConversations();

    return (
        <ul>
            {conversations?.map((conv) => (
                <li
                    key={conv.localId}
                    onClick={() => dispatch(setCurrentConversationAction({ conversation: conv }))}
                >
                    {conv.title}
                </li>
            ))}
        </ul>
    );
};

const App = () => (
    <GenAiStore>
        <MyConversations />
    </GenAiStore>
);
```

## Connect the assistant to a dashboard

Use `useDashboardCopilot` to connect one [`Dashboard`](../../dashboard-plugins/dashboard/) and one
`GenAIAssistant` through a shared `GenAiStore`. The hook keeps dashboard context current, applies dashboard
definitions from the assistant in edit mode, tracks progress and clarification questions, and synchronizes
saved dashboard and visualization identifiers with the originating conversation when you save the dashboard.

{{% alert color="warning" title="Alpha API" %}}
`useDashboardCopilot` and `CopilotInteractionComposingWithHandler` are `@alpha` and may change or be removed
without a major version bump.
{{% /alert %}}

Call the hook once per dashboard and assistant pair. Put both components inside the same `GenAiStore`, but wrap
only the dashboard in `CopilotInteractionComposingWithHandler`. This keeps the chat available while the dashboard
shows progress or waits for clarification answers.

The example assumes an authenticated backend and workspace from `BackendProvider` and `WorkspaceProvider`.
Use an agent with the dashboard editing skill enabled and replace `<dashboard-id>` with a dashboard you can edit.
Supply your application's dashboard navigation handler through `onLinkClick`; the hook doesn't handle opening
dashboard results from chat. See [Link clicks](../ai-assistant/#link-clicks) for the required handling.

```tsx
import { Dashboard, isDashboardSaved } from "@gooddata/sdk-ui-dashboard";
import {
    CopilotInteractionComposingWithHandler,
    GenAIAssistant,
    GenAiStore,
    type ChatUserMessageEvent,
    type GenAiStoreProps,
    isChatUserMessageEvent,
    useDashboardCopilot,
} from "@gooddata/sdk-ui-gen-ai";

import "@gooddata/sdk-ui-dashboard/styles/css/main.css";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";
import "@gooddata/sdk-ui-gen-ai/styles/css/copilotInteractionComposing.css";

type DashboardWithAssistantProps = {
    onLinkClick: NonNullable<GenAiStoreProps["onLinkClick"]>;
};

const chatEventHandlers = [
    {
        eval: isChatUserMessageEvent,
        handler: (event: ChatUserMessageEvent) => console.log(event.question),
    },
];

const dashboardEventHandlers = [
    {
        eval: isDashboardSaved,
        handler: () => console.log("Dashboard saved"),
    },
];

export function DashboardWithAssistant({ onLinkClick }: DashboardWithAssistantProps) {
    const { genAiStoreProps, dashboardProps, assistantProps, composingProps } = useDashboardCopilot();

    return (
        <GenAiStore
            {...genAiStoreProps({
                onLinkClick,
                eventHandlers: chatEventHandlers,
                onDispatcher: (dispatch) => console.log("AI Assistant dispatcher:", dispatch),
            })}
        >
            <div style={{ display: "flex", height: "100vh" }}>
                <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
                    <CopilotInteractionComposingWithHandler {...composingProps}>
                        <Dashboard
                            {...dashboardProps({
                                dashboard: "<dashboard-id>",
                                config: { initialRenderMode: "edit", enableInsightEditing: true },
                                eventHandlers: dashboardEventHandlers,
                                onStateChange: (state) => console.log("Dashboard state:", state),
                            })}
                        />
                    </CopilotInteractionComposingWithHandler>
                </div>
                <div style={{ width: 400, flexShrink: 0 }}>
                    <GenAIAssistant
                        {...assistantProps({
                            className: "my-assistant",
                            inputPlaceholder: "Ask about this dashboard",
                        })}
                    />
                </div>
            </div>
        </GenAiStore>
    );
}
```

### Customize the connected components

`genAiStoreProps`, `dashboardProps`, and `assistantProps` are functions, not prop objects. Pass your
customizations into them and spread the returned props onto the matching component. Call them without arguments
for the default connection, for example `assistantProps()`. Spread `composingProps` directly.

- `genAiStoreProps({ eventHandlers, onDispatcher })` retains the internal chat handlers and appends yours in the
  supplied order. Its `onDispatcher` calls the internal callback first, then yours with the same dispatcher.
- `dashboardProps({ eventHandlers, onStateChange, config })` retains the internal dashboard handlers and appends
  yours in the supplied order. Its `onStateChange` calls the internal callback first, then yours with the same
  state and dispatch. It preserves your configuration except for `config.aiMode`, which the copilot controls.
- `assistantProps({ className, inputPlaceholder, slots })` passes assistant customizations through while keeping
  `dashboardSelector` controlled by the hook, even if you supply your own selector or `null`.

Other props pass through unchanged. Attach chat `eventHandlers` and `onDispatcher` to the outer store through
`genAiStoreProps`, not the nested assistant. Don't override the returned connection props with later JSX props;
doing so replaces the internal handlers or context instead of composing them.

Keep your `eventHandlers` arrays stable between renders. The getters cache each combined array by the supplied
array's reference; a new dashboard handler array reinitializes the dashboard store. Declare static handlers
outside the component, as in the example, or use `useMemo` with the appropriate dependencies for handlers that
read props or state. Replace the array when handlers change instead of mutating it.

### Generate a new dashboard

For a new dashboard, omit the `dashboard` prop and mount an empty `Dashboard` in edit mode. After the dashboard
has initialized and the shared chat store is ready, call `generateDashboard(message)` from the hook. It starts
a new conversation and sends the generation request. Use an agent with the dashboard building skill enabled.

`generateDashboard` doesn't navigate, replace a saved dashboard, or save the generated result. It ignores calls
when the dashboard is still loading, isn't in edit mode, or has a saved dashboard identifier. Use
`sendMessage(message)` for follow-up requests in the current conversation. `cancelGeneration()` clears creation
intent; it doesn't stop an assistant response that is already streaming.

The hook owns one `CopilotHandler` for the pair and manages its lifecycle. Remount the pair when changing the
backend or workspace. See the [hook return values](../ai-assistant/#usedashboardcopilot-hook) for the other helpers.

### Provide dashboard context without copilot editing

If you only need the assistant to read dashboard context, pass `dashboardSelector` directly instead of using
`useDashboardCopilot`. This keeps the AI Assistant informed about filters and widgets but doesn't apply generated
dashboard definitions or show composing progress.

To do this, you need to capture the `DashboardSelectorEvaluator` from the `onStateChange` callback of the `Dashboard` component and pass it to the `GenAIAssistant`.
If the dashboard is closed or unmounted, pass `null` to clear the previously derived ambient dashboard context.

```tsx
import { useCallback, useState } from "react";
import { Dashboard, DashboardSelectorEvaluator, DashboardState } from "@gooddata/sdk-ui-dashboard";
import { GenAIAssistant, GenAiStore } from "@gooddata/sdk-ui-gen-ai";

export function App() {
    const dashboardId = "<dashboard-id>";
    const [evaluator, setEvaluator] = useState<DashboardSelectorEvaluator | undefined>();

    const onStateChange = useCallback((state: DashboardState) => {
        // Capture the selector evaluator from the state
        const dashboardSelect: DashboardSelectorEvaluator = (select) => select(state);
        setEvaluator(() => dashboardSelect);
    }, []);

    return (
        <>
            <GenAiStore>
                <GenAIAssistant dashboardSelector={evaluator} />
            </GenAiStore>
            <Dashboard dashboard={dashboardId} onStateChange={onStateChange} />
        </>
    );
}
```

## Run Key Driver Analysis on chat visualizations

Mount `GenAiKeyDriverAnalysis` next to `GenAIAssistant` inside the same `GenAiStore`. See [Key Driver Analysis component](../ai-assistant/#key-driver-analysis-component).

## Hand a Semantic Search query to the assistant

Let users move from a search to a conversation about the same query: put `FooterButtonAiAssistant` in the footer of [`SemanticSearch`](../semantic-search/), and when the user clicks it, send the query to the assistant through the store dispatcher.

You need:

- `SemanticSearch` and `FooterButtonAiAssistant` from `@gooddata/sdk-ui-semantic-search`
- `GenAIAssistant`, the `clearThreadAction` and `newMessageAction` actions, and the `makeUserItem` helper from `@gooddata/sdk-ui-gen-ai`

```tsx
import { useCallback, useEffect, useState } from "react";
import { SemanticSearch, FooterButtonAiAssistant } from "@gooddata/sdk-ui-semantic-search";
import {
    GenAIAssistant,
    type GenAIAssistantProps,
    clearThreadAction,
    newMessageAction,
    makeUserItem,
} from "@gooddata/sdk-ui-gen-ai";

type ChatDispatcher = Parameters<NonNullable<GenAIAssistantProps["onDispatcher"]>>[0];

const MyCustomSearchComponentWithAiAssistant = () => {
    const [chatDispatcher, setDispatcher] = useState<ChatDispatcher | null>(null);
    const [askedQuestion, setAskedQuestion] = useState("");
    const onDispatcher = useCallback(
        (dispatcher: ChatDispatcher) => {
            setDispatcher(() => dispatcher);
        },
        [setDispatcher],
    );

    useEffect(() => {
        if (!chatDispatcher || !askedQuestion) {
            return;
        }

        chatDispatcher(clearThreadAction());
        chatDispatcher(newMessageAction(makeUserItem({ type: "text", text: askedQuestion })));
    }, [chatDispatcher, askedQuestion]);

    return (
        <>
            <SemanticSearch
                onSelect={(item) => {
                    console.log("Selected item:", item);
                }}
                objectTypes={["dashboard", "visualization", "metric"]}
                renderFooter={({ value }, { closeSearch }) => (
                    <FooterButtonAiAssistant
                        onClick={() => {
                            // You can extend the search query with additional context.
                            setAskedQuestion(`Build new visualization based on: ${value}`);
                            closeSearch();
                        }}
                    />
                )}
            />
            <GenAIAssistant onDispatcher={onDispatcher} />
        </>
    );
};
```

When the user clicks the button, the search dropdown closes, the chat thread is cleared, and the query goes to the assistant as a user message. Users can still pick a search result through `onSelect`.
