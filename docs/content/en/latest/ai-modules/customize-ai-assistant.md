---
title: Customize the AI Assistant
category: AI & Modules
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-gen-ai:IGenAIAssistantSlots"
  - "@gooddata/sdk-ui-gen-ai:GenAIAssistant"
  - "@gooddata/sdk-ui-gen-ai:IGenAIAssistantSendButtonProps"
  - "@gooddata/sdk-ui-gen-ai:DefaultSendButton"
  - "@gooddata/sdk-ui-gen-ai:IGenAIAssistantConversationVisualisationProps"
  - "@gooddata/sdk-ui-gen-ai:DefaultConversationVisualizationBody"
source_files:
  - src/components/customized/types.ts
  - src/components/customized/SendButton.tsx
  - src/components/customized/ConversationVisualizationBody.tsx
  - src/components/messages/conversationContents/ConversationVisualizationContent.tsx
  - src/components/GenAIChat.tsx
  - src/components/GenAIStandaloneInput.tsx
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/ai-modules/ai-assistant-layout
  - /docs/ai-modules/control-ai-assistant
  - /docs/integrations/embedding/apply-theming
description: Customize the AI Assistant input placeholder and send button, or replace and wrap parts of its UI through slots.
ai_generated_body: true
type: docs
weight: 53
section: AI & Modules
---

Set `inputPlaceholder` to change the AI Assistant's chat input hint, or pass your own components in the `slots` prop of `GenAIAssistant` (and of `GenAIConversations` for the conversation history). Each slot component receives `Default`, the built-in component, and `defaultProps`, its props. Render `Default` with `defaultProps` to wrap the built-in UI, or render your own markup to replace it. The [slot list](../ai-assistant/#slots) on the reference page shows every slot and its stability.

## Set the input placeholder

Pass `inputPlaceholder` to `GenAIAssistant` to replace the chat input placeholder without replacing any UI components:

```tsx
import { GenAIAssistant } from "@gooddata/sdk-ui-gen-ai";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

export const App = () => <GenAIAssistant inputPlaceholder="Ask about your data…" />;
```

Omit `inputPlaceholder` to keep the bundled placeholder for the assistant's `locale` (`Ask here…` in English). Custom text is displayed as-is; translate it in your application before passing it to the component. Pass an empty string (`inputPlaceholder=""`) to hide the placeholder.

The standalone input accepts the same prop:

```tsx
import { GenAIStandaloneInput } from "@gooddata/sdk-ui-gen-ai/internal";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

export const StandaloneInput = () => (
    <GenAIStandaloneInput
        inputPlaceholder="Start a conversation about your data…"
        onStart={(prompt) => console.log(prompt)}
    />
);
```

`GenAIStandaloneInput` is an internal API and may change without notice. Its existing `placeholder` prop remains supported. When both props are supplied, `inputPlaceholder` takes precedence, including when it is an empty string. When neither is supplied, the input uses the bundled localized placeholder.

{{% alert color="warning" title="Alpha API" %}}
The `LandingScreen`, `Disclaimer`, `AgentItem`, and `SendButton` slots are public, as is `DefaultSendButton`.
All other slots, their props types, and all other `Default*` building blocks are `@alpha` and may change or be removed
without a major version bump.
{{% /alert %}}

## Replace the landing screen

The landing screen is what users see before they send their first message: by default, a title and suggested questions. Once a user submits a question, the assistant switches to the chat.

To replace the default initial experience, provide the `slots.LandingScreen` prop.
This prop accepts a React component type, which is rendered as the initial assistant experience.

```tsx
import { GenAIAssistant } from "@gooddata/sdk-ui-gen-ai";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const CustomLandingScreen = () => (
    <div style={{ padding: 24 }}>
        <h3>Welcome to the embedded assistant</h3>
        <p>Describe what you are looking for and we will prepare the right visualization.</p>
    </div>
);

export const App = () => (
    <GenAIAssistant
        slots={{
            LandingScreen: CustomLandingScreen,
        }}
    />
);
```

The package exports building blocks used by the default initial assistant experience.
You can use these components to apply custom branding or modify content while preserving the built-in layout,
accessibility, and automated question behavior.

Default components you can reuse:

- `DefaultLandingScreen`
- `DefaultLandingContainer` and `DefaultLandingQuestions`
- `DefaultLandingTitle` and `DefaultLandingTitleAscent`
- `DefaultLandingQuestion`

The slot gets `IGenAIAssistantLandingScreenProps` in `defaultProps`: `isFullscreen`, `isBigScreen`, and `isSmallScreen`, which tell you the layout and the screen size.

To extend the default experience (for example, to customize the suggested questions), compose the
exported building blocks in your own component. The `Default` component of this slot does not accept
children; pass the slot props to `DefaultLandingContainer` and `DefaultLandingQuestions` instead so that the
built-in responsive layout is preserved:

```tsx
import {
    DefaultLandingContainer,
    DefaultLandingQuestion,
    DefaultLandingQuestions,
    DefaultLandingTitle,
    DefaultLandingTitleAscent,
    type IGenAIAssistantLandingScreenProps,
} from "@gooddata/sdk-ui-gen-ai";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomDefaultLanding = ({ defaultProps }: ISlotProps<IGenAIAssistantLandingScreenProps>) => (
    <DefaultLandingContainer {...defaultProps}>
        <DefaultLandingTitle>
            <DefaultLandingTitleAscent>Ask AI to explore your workspace</DefaultLandingTitleAscent>
            <br />
            Pick one of the suggestions below.
        </DefaultLandingTitle>
        <DefaultLandingQuestions {...defaultProps}>
            <DefaultLandingQuestion
                question="Show revenue by product for 2024"
                answer="Here is the revenue by product for 2024"
            />
            <DefaultLandingQuestion question="What is our YoY trend?" answer="Here is the year-over-year trend" />
        </DefaultLandingQuestions>
    </DefaultLandingContainer>
);

export const App = () => (
    <GenAIAssistant
        slots={{
            LandingScreen: CustomDefaultLanding,
        }}
    />
);
```

You can also reuse individual building blocks, such as `DefaultLandingQuestion`, inside a fully custom layout.
This allows you to create a personalized introduction while keeping the pre-wired behavior of the suggested questions.

Clicking a `DefaultLandingQuestion` seeds the current conversation with two ready-made messages: the `question`
as the user message and the `answer` as the assistant reply. It does not send the question to the assistant;
the user continues the conversation from there through the chat input. The optional `title` is the button label
(defaults to `question`) and `icon` adds an icon in front of it.

```tsx
const CustomLandingScreen = () => (
    <div className="my-company-landing">
        <h3>Welcome back!</h3>
        <p>Use the shortcuts to get started quickly.</p>
        <div className="my-company-landing__actions">
            <DefaultLandingQuestion
                question="List my top KPIs"
                answer="Here are your top KPIs"
                title="Top KPIs"
            />
            <DefaultLandingQuestion
                question="Create a new dashboard"
                answer="Here is a blank dashboard to start with"
                title="New dashboard"
            />
        </div>
    </div>
);
```

## Customize the disclaimer

You can also customize or hide the disclaimer rendered below the chat input using `slots.Disclaimer`.

Default components you can reuse:

- `DefaultDisclaimer`

```tsx
import { GenAIAssistant } from "@gooddata/sdk-ui-gen-ai";

const CustomDisclaimer = () => (
    <div style={{ color: "gray", textAlign: "center", fontSize: 10, padding: 4 }}>
        Please note that AI-generated content may be inaccurate.
    </div>
);

export const App = () => (
    <GenAIAssistant
        slots={{
            Disclaimer: CustomDisclaimer,
        }}
    />
);
```

To hide the disclaimer entirely, return `null`:

```tsx
export const App = () => (
    <GenAIAssistant
        slots={{
            Disclaimer: () => null,
        }}
    />
);
```

## Customize the send button

Pass a component through `slots.SendButton` to replace the chat input's send button without targeting the SDK's internal markup with CSS:

```tsx
import { GenAIAssistant, type IGenAIAssistantSlots } from "@gooddata/sdk-ui-gen-ai";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const CustomSendButton: NonNullable<IGenAIAssistantSlots["SendButton"]> = ({ defaultProps }) => (
    <button type="button" disabled={defaultProps.isDisabled} onClick={defaultProps.onClick}>
        {defaultProps.isInProgress ? "Generating…" : "Send message"}
    </button>
);

export const App = () => <GenAIAssistant slots={{ SendButton: CustomSendButton }} />;
```

The slot receives `Default` and `defaultProps`. The public `IGenAIAssistantSendButtonProps` type describes `defaultProps`:

- `onClick`: sends the current input. It does nothing while sending is disabled or agent selection is loading.
- `isDisabled`: whether sending is unavailable, including when the input is empty or the assistant is busy. Use this for the button's disabled state.
- `isInProgress`: whether the assistant is generating a response in the current conversation. Use this to show a progress label or indicator, not to decide whether sending is enabled.

Give your button an accessible name and translate custom labels in your application. For an icon-only button, provide an `aria-label`.

To wrap the built-in button instead of replacing it, render `Default` with `defaultProps`:

```tsx
const WrappedSendButton: NonNullable<IGenAIAssistantSlots["SendButton"]> = ({ Default, defaultProps }) => (
    <div className="my-company-send-button">
        <Default {...defaultProps} />
    </div>
);
```

You can also import the public `DefaultSendButton` component from `@gooddata/sdk-ui-gen-ai` for reuse inside a slot.
Without `slots.SendButton`, the assistant keeps its localized send button and tooltip, disabled while a response is generating. Enter-to-send is unchanged.

The internal `GenAIStandaloneInput` component accepts the same slot. Its `isInProgress` is always `false` because it starts a conversation rather than generating a response itself.

## Replace the agent chooser

You can customize the whole agent chooser component using `slots.AgentChooser`. This allows you to replace the default agent dropdown with your own UI.

Default components you can reuse:

- `DefaultAgentChooser`

The slot gets `IGenAIAssistantAgentChooserProps` in `defaultProps`: the available `agents`, the `conversations`, the agent IDs of the current conversation (`conversationAgentId`), of the selection (`selectedAgentId`), and of the effective selection (`effectiveSelectedAgentId`), the `isDisabled` and `isLoading` flags, `onSelectAgent`, and the reasoning effort (`selectedEffort`, `onSelectEffort`).

```tsx
import { GenAIAssistant, IGenAIAssistantAgentChooserProps } from "@gooddata/sdk-ui-gen-ai";
import { ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomAgentChooser = ({ Default, defaultProps }: ISlotProps<IGenAIAssistantAgentChooserProps>) => {
    const { agents, onSelectAgent, effectiveSelectedAgentId } = defaultProps;
    return (
        <div style={{ border: "1px solid #ccc", padding: 4 }}>
            <select value={effectiveSelectedAgentId} onChange={(e) => onSelectAgent(e.target.value)}>
                {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                        {agent.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export const App = () => (
    <GenAIAssistant
        slots={{
            AgentChooser: CustomAgentChooser,
        }}
    />
);
```

## Customize agent items

You can customize how individual agents are rendered in the default agent chooser dropdown using `slots.AgentItem`.

Default components you can reuse:

- `DefaultAgentItem`

The slot gets `IGenAIAssistantAgentItemProps` in `defaultProps`: the `agent`, whether it `isSelected`, the `menuItemProps` of the menu row, and an optional `Content` component.

```tsx
import { GenAIAssistant, IGenAIAssistantAgentItemProps } from "@gooddata/sdk-ui-gen-ai";
import { ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomAgentItem = ({ defaultProps }: ISlotProps<IGenAIAssistantAgentItemProps>) => {
    const { agent, isSelected } = defaultProps;
    return (
        <div
            style={{
                padding: "8px 12px",
                backgroundColor: isSelected ? "#f0f0f0" : "transparent",
                cursor: "pointer",
            }}
        >
            <strong>{agent.title}</strong>
            {isSelected && <span> (Selected)</span>}
        </div>
    );
};

export const App = () => (
    <GenAIAssistant
        slots={{
            AgentItem: CustomAgentItem,
        }}
    />
);
```

To preserve the default menu item behavior (hover effects, keyboard navigation, etc.) while only changing its content, use your custom content in the `Default` component provided in the slot:

```tsx
const CustomAgentItem = ({ Default, defaultProps }: ISlotProps<IGenAIAssistantAgentItemProps>) => {
    const { agent } = defaultProps;
    return (
        <Default
            {...defaultProps}
            Content={(props) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "green" }} />
                    {agent.title}
                    {props.isFocused && <span> (Focused)</span>}
                </div>
            )}
        />
    );
};
```

## Customize conversation history

You can customize the conversation history UI (in `GenAIAssistant` and `GenAIConversations`) using these slots:

- `slots.ConversationDrawerHeader`: header of the conversation drawer.
- `slots.ConversationHeader`: content rendered above each conversation group.
- `slots.ConversationFooter`: content rendered below each conversation group.
- `slots.ConversationDateGrouping`: date-group labels (for example "Today" or "Last week").
- `slots.ConversationItem`: wrapper for each interactive conversation row.
- `slots.ConversationRenameDialog`: confirmation dialog for renaming a conversation.
- `slots.ConversationDeleteDialog`: confirmation dialog for deleting a conversation.

Default components you can reuse:

- `DefaultConversationDrawerHeader`
- `DefaultConversationHeader`
- `DefaultConversationFooter`
- `DefaultConversationDateGrouping`
- `DefaultConversationItem`
- `DefaultConversationRenameDialog`
- `DefaultConversationDeleteDialog`

The slots get these props in `defaultProps`:

- `ConversationDrawerHeader` (`IGenAIAssistantConversationDrawerHeaderProps`): the localized `title` of the drawer.
- `ConversationHeader` and `ConversationFooter` (`IGenAIAssistantConversationHeaderProps`, `IGenAIAssistantConversationFooterProps`): the `id` of the conversation group and its `listItems`.
- `ConversationDateGrouping` (`IGenAIAssistantConversationDateGroupingProps`): the `menuGroupItemProps` of the date-group row.
- `ConversationItem` (`IGenAIAssistantConversationItemProps`): the `conversation` and the `menuItemProps` of its row.
- `ConversationRenameDialog` (`IGenAIAssistantConversationRenameDialogProps`): the `conversation` to rename, `onRename` and `onClose` callbacks, and optional overrides for `title`, `label`, `submitButtonText`, and `cancelButtonText`.
- `ConversationDeleteDialog` (`IGenAIAssistantConversationDeleteDialogProps`): the `conversation` to delete, `onDelete` and `onClose` callbacks, and optional overrides for `title`, `body`, `submitButtonText`, and `cancelButtonText`.

```tsx
import {
    GenAIAssistant,
    type IGenAIAssistantConversationHeaderProps,
    type IGenAIAssistantConversationFooterProps,
    type IGenAIAssistantConversationDrawerHeaderProps,
    type IGenAIAssistantConversationItemProps,
    type IGenAIAssistantConversationDateGroupingProps,
    type IGenAIAssistantConversationRenameDialogProps,
    type IGenAIAssistantConversationDeleteDialogProps,
} from "@gooddata/sdk-ui-gen-ai";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomConversationDrawerHeader = ({
    defaultProps,
}: ISlotProps<IGenAIAssistantConversationDrawerHeaderProps>) => {
    return <div style={{ padding: "8px 12px", fontWeight: 600 }}>History: {defaultProps.title}</div>;
};

const CustomConversationHeader = ({ defaultProps }: ISlotProps<IGenAIAssistantConversationHeaderProps>) => {
    if (defaultProps.listItems.length === 0) {
        return null;
    }

    return <div style={{ padding: "4px 12px", opacity: 0.75 }}>Items: {defaultProps.listItems.length}</div>;
};

const CustomConversationFooter = ({ defaultProps }: ISlotProps<IGenAIAssistantConversationFooterProps>) => {
    if (defaultProps.listItems.length === 0) {
        return null;
    }

    return <div style={{ margin: "4px 12px", borderTop: "1px solid #eee" }} />;
};

const CustomConversationDateGrouping = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantConversationDateGroupingProps>) => {
    return <Default {...defaultProps} />;
};

const CustomConversationItem = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantConversationItemProps>) => {
    return (
        <div style={{ borderLeft: "2px solid transparent" }}>
            <Default {...defaultProps} />
        </div>
    );
};

const CustomConversationRenameDialog = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantConversationRenameDialogProps>) => {
    return (
        <Default
            {...defaultProps}
            title="Rename conversation"
            submitButtonText="Save"
            cancelButtonText="Cancel"
        />
    );
};

const CustomConversationDeleteDialog = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantConversationDeleteDialogProps>) => {
    return (
        <Default
            {...defaultProps}
            title="Delete conversation?"
            submitButtonText="Delete"
            cancelButtonText="Cancel"
        />
    );
};

export const App = () => (
    <GenAIAssistant
        slots={{
            ConversationDrawerHeader: CustomConversationDrawerHeader,
            ConversationHeader: CustomConversationHeader,
            ConversationFooter: CustomConversationFooter,
            ConversationDateGrouping: CustomConversationDateGrouping,
            ConversationItem: CustomConversationItem,
            ConversationRenameDialog: CustomConversationRenameDialog,
            ConversationDeleteDialog: CustomConversationDeleteDialog,
        }}
    />
);
```

Use `Default` + `defaultProps` when you want to preserve built-in menu semantics and interaction behavior.

## Customize user and assistant messages

You can customize the wrapper and layout for user and assistant messages using `slots.UserMessage` and `slots.AssistantMessage`.

Default components you can reuse:

- `DefaultUserMessage`
- `DefaultAssistantMessage`

Both slots get the same props in `defaultProps` (`IGenAIAssistantUserMessageProps`, `IGenAIAssistantAssistantMessageProps`): the `message`, all message `groups` of the conversation, and whether the message `isLast`.

```tsx
import {
    GenAIAssistant,
    IGenAIAssistantUserMessageProps,
    IGenAIAssistantAssistantMessageProps,
} from "@gooddata/sdk-ui-gen-ai";
import { ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomUserMessage = ({ Default, defaultProps }: ISlotProps<IGenAIAssistantUserMessageProps>) => (
    <div style={{ border: "1px solid blue", borderRadius: 8, margin: "4px 0" }}>
        <Default {...defaultProps} />
    </div>
);

const CustomAssistantMessage = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantAssistantMessageProps>) => (
    <div style={{ border: "1px solid green", borderRadius: 8, margin: "4px 0" }}>
        <Default {...defaultProps} />
    </div>
);

export const App = () => (
    <GenAIAssistant
        slots={{
            UserMessage: CustomUserMessage,
            AssistantMessage: CustomAssistantMessage,
        }}
    />
);
```

## Customize message content

For granular control over message rendering, you can customize specific content types:

- `MessageTextContent`: Customizes the rendering of text and linked metadata objects.
- `MessageErrorContent`: Customizes how errors are displayed within the chat.
- `MessageReasoningContent`: Customizes the rendering of the assistant's reasoning or thought process.
- `MessageMultipartContent`: Customizes the rendering of complex messages containing multiple parts.
- `ConversationVisualizationContent`: Customizes rendering and menu actions of visualization parts in multipart content.
- `ConversationVisualizationBody`: Replaces only the chart body while preserving the surrounding visualization controls (`@alpha`).
- `ConversationKdaContent`: Customizes rendering of Key Driver Analysis parts in multipart content (`@alpha`).

Default components you can reuse:

- `DefaultMessageTextContent`
- `DefaultMessageErrorContent`
- `DefaultMessageReasoningContent`
- `DefaultMessageMultipartContent`
- `DefaultConversationVisualizationContent`
- `DefaultConversationVisualizationBody`
- `DefaultConversationKdaContent`

The slots get these props in `defaultProps`:

- `MessageTextContent`: the `text`, the metadata `objects` rendered as links in it, and `isLoading`.
- `MessageErrorContent`: the error `message`, and optionally its `code`, `reason`, `traceId`, and `isLoading`.
- `MessageReasoningContent`: the reasoning `summary`, the referenced `objects`, optional `durationMs` (`number`), optional `agent` (`{ id: string; name?: string }`), and `isLoading`.
- `MessageMultipartContent`: the `message`, its `parts` (text, visualization, dashboard, and so on), the shared `references`, and `isLast`.
- `ConversationVisualizationContent`: the `message`, the `part`, the `visualization` to render, an optional what-if `scenario`, `className`, `menuItems`, and `enableKeyDriverAnalysis` (alpha), which turns explain on charts on or off. It defaults to whether `GenAiKeyDriverAnalysis` is mounted and the workspace setting is on.
- `ConversationVisualizationBody`: the `message`, the `visualization`, `isTable`, rendering configuration, feature flags, and rendering and drilling callbacks. See [Customize the visualization body](#customize-the-visualization-body).
- `ConversationKdaContent`: the `kda` definition, `className`, and `enableKeyDriverAnalysis`, with the same default.

`durationMs` is the reasoning-group duration in milliseconds, matching the built-in reasoning header. It is the absolute difference between the last message's `createdAt` timestamp in the reasoning group and the last message's timestamp in the preceding group. It includes tool activity grouped with reasoning, but excludes answer generation; it is not the total response duration or a measurement of reasoning-text streaming alone.

The value updates as the group's message timestamps change during streaming and is recalculated from those same timestamps when conversation history is reloaded. It does not depend on Interaction Intelligence being enabled and does not fetch interaction steps or require additional API requests. When the required group or message timestamps are unavailable, `durationMs` is `undefined`. Check explicitly for `undefined` so that a valid duration of `0` is still displayed, as in the example below.

`agent` identifies the user-selected agent recorded for that message, not an internally routed sub-agent. It is available for live messages and reloaded history when the backend supplies the per-message `agentId`. Switching agents does not change the identity on earlier messages. The optional `name` comes from the matching agent's current `title` in the loaded agent list, not a historical snapshot; when the agent is unavailable, the `id` is still provided. If a message has no `agentId`, `agent` is `undefined` rather than falling back to the conversation's current agent. Resolving this prop uses the existing agent list and makes no additional API requests.

Use `menuItems` of `ConversationVisualizationContent` to hide specific menu actions:

| `menuItems` key | Type      | Description                                                                                  |
| --------------- | --------- | -------------------------------------------------------------------------------------------- |
| `save`          | `boolean` | Show or hide the **Save visualization** action.                                              |
| `openInAnalyze` | `boolean` | Show or hide the **Open in Analyze** action.                                                 |
| `copyLink`      | `boolean` | Show or hide the **Copy visualization link** action (shown only for saved visualizations).  |

All three default to `true`. If all three menu actions are disabled (`false`), the visualization menu button is hidden.

```tsx
import {
    GenAIAssistant,
    IGenAIAssistantMessageTextContentProps,
    IGenAIAssistantMessageErrorContentProps,
    IGenAIAssistantMessageReasoningContentProps,
    IGenAIAssistantMessageMultipartContentProps,
    IGenAIAssistantConversationVisualizationContentProps,
} from "@gooddata/sdk-ui-gen-ai";
import { ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomTextContent = ({ Default, defaultProps }: ISlotProps<IGenAIAssistantMessageTextContentProps>) => (
    <div style={{ fontStyle: "italic", color: "#333" }}>
        <Default {...defaultProps} />
    </div>
);

const CustomErrorContent = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantMessageErrorContentProps>) => (
    <div style={{ backgroundColor: "#fff0f0", border: "1px solid red", padding: 8 }}>
        <strong>Error:</strong> <Default {...defaultProps} />
    </div>
);

const CustomReasoningContent = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantMessageReasoningContentProps>) => (
    <div style={{ borderLeft: "2px solid #ccc", paddingLeft: 8, opacity: 0.8 }}>
        <Default {...defaultProps} />
        {defaultProps.agent && (
            <small>Agent: {defaultProps.agent.name ?? defaultProps.agent.id}</small>
        )}
        {defaultProps.durationMs !== undefined && (
            <small>Reasoning: {(defaultProps.durationMs / 1000).toFixed(1)} s</small>
        )}
    </div>
);

const CustomMultipartContent = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantMessageMultipartContentProps>) => (
    <div className="custom-multipart">
        <Default {...defaultProps} />
    </div>
);

const CustomVisualizationContent = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantConversationVisualizationContentProps>) => (
    <Default
        {...defaultProps}
        menuItems={{
            ...defaultProps.menuItems,
            copyLink: false,
        }}
    />
);

export const App = () => (
    <GenAIAssistant
        slots={{
            MessageTextContent: CustomTextContent,
            MessageErrorContent: CustomErrorContent,
            MessageReasoningContent: CustomReasoningContent,
            MessageMultipartContent: CustomMultipartContent,
            ConversationVisualizationContent: CustomVisualizationContent,
        }}
    />
);
```

## Customize the visualization body

Use `slots.ConversationVisualizationBody` (`@alpha`) when you only need to replace the chart rendering, for example to show headlines as your application's KPI cards. Unlike replacing the whole `ConversationVisualizationContent`, this keeps the SDK wrapper, title, visualization menu, **Show as table** toggle, save dialog, and error boundary. You do not need to recreate the menu handlers or hide the SDK chart with CSS.

When **Show as table** is active (`isTable` is `true`), the SDK always uses its default renderer and does not render the custom body slot. Table rendering cannot be customized through this slot. Switching back to the chart restores the custom body.

The slot follows the same `Default` / `defaultProps` contract. This example replaces headlines but delegates other chart types to the SDK:

```tsx
import {
    GenAIAssistant,
    type IGenAIAssistantConversationVisualisationProps,
} from "@gooddata/sdk-ui-gen-ai";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import { HostHeadline } from "./HostHeadline";

const CustomVisualizationBody = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantConversationVisualisationProps>) => {
    if (defaultProps.visualization.insight.visualizationUrl === "local:headline") {
        return <HostHeadline {...defaultProps} />;
    }

    return <Default {...defaultProps} />;
};

export const App = () => (
    <GenAIAssistant
        slots={{
            ConversationVisualizationBody: CustomVisualizationBody,
        }}
    />
);
```

`HostHeadline` is your application's renderer accepting `IGenAIAssistantConversationVisualisationProps`. In chart mode, the SDK chart renderer is not mounted and does not run its visualization query unless the slot renders `Default`. In table mode, the SDK automatically mounts its default renderer instead of the slot. Omitting the slot preserves the default SDK rendering. `DefaultConversationVisualizationBody` is also exported for reuse.

The body receives the following in `defaultProps`:

- `message` and `visualization`: the conversation message and the original visualization payload, including its `insight`.
- `isTable`: the state of the surrounding table toggle. The custom slot is only rendered when this is `false`; table mode always uses the default SDK renderer.
- `colorPalette`, `separators`, `settings`, `agGridToken`, and `execConfig`: rendering configuration. `execConfig` includes any what-if scenario overrides.
- `enableDrilling`, `enableChangeAnalysis`, `enableSecondGranularities`, and `enableAccessibleChartTooltip`: flags controlling rendering features.
- `onVisualisationError` and `onVisualisationSuccess`: call these when your renderer fails or succeeds to keep the surrounding error report and menu state synchronized.
- `onDrillFired`: call this with `{ keyDriverData, event }` when your renderer provides Key Driver Analysis drill options, or with `null` to clear them. Honor `enableDrilling` when implementing custom drilling.

## Customize the visualization menu

Use the `VisualizationMenu` slot (`@alpha`) to change the menu that opens from the `...` button on a visualization in a message. The slot gets the built-in items in `defaultProps.items`. Pass a different list to `Default` to add, remove, or reorder the items.

The built-in items have the ids `button-save`, `button-open`, and `button-copy`. The menu closes after the user selects an item. When the list is empty, the menu button is hidden. Users without permission to use Analytical Designer get no built-in items, but your own items still show.

The slot gets these props in `defaultProps`: the `message`, the `part`, the `visualization`, an optional what-if `scenario`, the menu `items`, `isVisualizationSaved`, `isDisabled`, and `ariaDescribedBy`. Each item (`IGenAIAssistantVisualizationMenuItem`) has these properties:

| Property         | Type                                          | Description                                                            |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `id`             | `string`                                      | Unique identifier of the item.                                         |
| `title`          | `string`                                      | Title displayed in the menu.                                           |
| `icon`           | `ReactNode`                                   | (Optional) Icon displayed before the title.                            |
| `isDisabled`     | `boolean`                                     | (Optional) Whether the item is disabled.                               |
| `ariaAttributes` | `AriaAttributes`                              | (Optional) Additional ARIA attributes of the item.                     |
| `onSelect`       | `(event: MouseEvent \| KeyboardEvent) => void` | Called when the user selects the item. The menu closes after the call. |

```tsx
import { GenAIAssistant, type IGenAIAssistantVisualizationMenuProps } from "@gooddata/sdk-ui-gen-ai";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomVisualizationMenu = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantVisualizationMenuProps>) => (
    <Default
        {...defaultProps}
        items={[
            // Remove the built-in "Open in Analyze" item.
            ...defaultProps.items.filter((item) => item.id !== "button-open"),
            {
                id: "share-to-slack",
                title: "Share to Slack",
                onSelect: () => shareToSlack(defaultProps.visualization),
            },
        ]}
    />
);

export const App = () => (
    <GenAIAssistant
        slots={{
            VisualizationMenu: CustomVisualizationMenu,
        }}
    />
);
```

## Customize follow-up questions and feedback

You can customize the interactive elements that appear after assistant messages, such as follow-up question buttons and feedback options.

### Follow-up buttons

Use `slots.FollowUpButtons` to customize the list of suggested follow-up questions.

Default components you can reuse:

- `DefaultFollowUpButtons`

The slot gets `IGenAIAssistantFollowUpButtonsProps` in `defaultProps`: the assistant `message` and its `suggestions`.

```tsx
import { GenAIAssistant, IGenAIAssistantFollowUpButtonsProps } from "@gooddata/sdk-ui-gen-ai";
import { ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomFollowUpButtons = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantFollowUpButtonsProps>) => (
    <div style={{ border: "1px dashed gray", padding: 8 }}>
        <p>Suggestions:</p>
        <Default {...defaultProps} />
    </div>
);

export const App = () => (
    <GenAIAssistant
        slots={{
            FollowUpButtons: CustomFollowUpButtons,
        }}
    />
);
```

### Feedback

Use `slots.Feedback` to customize the thumbs up/down feedback buttons.

Default components you can reuse:

- `DefaultFeedback`

The slot gets `IGenAIAssistantFeedbackProps` in `defaultProps`: the assistant `message`, its `group`, and the `isLast`, `isHidden`, and `isComplete` flags.

```tsx
import { GenAIAssistant, IGenAIAssistantFeedbackProps } from "@gooddata/sdk-ui-gen-ai";
import { ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomFeedback = ({ Default, defaultProps }: ISlotProps<IGenAIAssistantFeedbackProps>) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span>Was this helpful?</span>
        <Default {...defaultProps} />
    </div>
);

export const App = () => (
    <GenAIAssistant
        slots={{
            Feedback: CustomFeedback,
        }}
    />
);
```

### Follow-up question

Use `slots.FollowUpQuestion` to customize the rendering of an individual follow-up question.

Default components you can reuse:

- `DefaultFollowUpQuestion`

The slot gets `IGenAIAssistantFollowUpQuestionProps` in `defaultProps`: the assistant `message`, the `question` text, and the metadata `references` in it.

```tsx
import { GenAIAssistant, IGenAIAssistantFollowUpQuestionProps } from "@gooddata/sdk-ui-gen-ai";
import { ISlotProps } from "@gooddata/sdk-ui-kit";

const CustomFollowUpQuestion = ({
    Default,
    defaultProps,
}: ISlotProps<IGenAIAssistantFollowUpQuestionProps>) => (
    <div style={{ color: "blue", textDecoration: "underline" }}>
        <Default {...defaultProps} />
    </div>
);

export const App = () => (
    <GenAIAssistant
        slots={{
            FollowUpQuestion: CustomFollowUpQuestion,
        }}
    />
);
```
