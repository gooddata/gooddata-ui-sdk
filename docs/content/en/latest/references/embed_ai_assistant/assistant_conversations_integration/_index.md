---
title: Assistant + Conversations integration
linkTitle: Assistant + Conversations integration
copyright: (C) 2025 GoodData Corporation
weight: 72
---

This guide shows how to integrate `GenAIAssistant` and `GenAIConversations` in a split layout, based on the playground wiring pattern.

Use this setup when you want to render:

- a dedicated conversation list panel,
- a separate assistant message panel,
- synchronized selection, deletion handling, and new-conversation actions.

```tsx
import { CSSProperties, useMemo, useRef, useState } from "react";

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
            eventHandlers={events}
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

### How the integration works

- `GenAiStore` provides a shared dispatcher and synchronized state for both components.
- A shared "new conversation" button dispatches `startNewConversationAction` once through the shared store dispatcher, keeping both panels in sync.
