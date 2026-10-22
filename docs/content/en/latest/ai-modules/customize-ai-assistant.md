---
title: Customize the AI Assistant
linkTitle: Customize the assistant
category: AI & Modules
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-gen-ai:IGenAIAssistantSlots"
  - "@gooddata/sdk-ui-gen-ai:GenAIAssistant"
source_files:
  - src/components/customized/types.ts
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/ai-modules/ai-assistant-layout
  - /docs/ai-modules/control-ai-assistant
  - /docs/integrations/embedding/apply-theming
description: Replace or wrap parts of the AI Assistant UI through slots, from the landing screen and the agent chooser to messages, follow-up questions, and feedback.
ai_generated_body: true
type: docs
weight: 53
section: AI & Modules
---

Change parts of the AI Assistant UI by passing your own components in the `slots` prop of `GenAIAssistant` (and of `GenAIConversations` for the conversation history). Each slot component receives `Default`, the built-in component, and `defaultProps`, its props. Render `Default` with `defaultProps` to wrap the built-in UI, or render your own markup to replace it. The [slot list](../ai-assistant/#slots) on the reference page shows every slot and its stability.

{{% alert color="warning" title="Alpha API" %}}
Only the `LandingScreen`, `Disclaimer`, and `AgentItem` slots are public. All other slots, their props types, and every
`Default*` building block are `@alpha` and may change or be removed without a major version bump.
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

Default components you can reuse:

- `DefaultConversationDrawerHeader`
- `DefaultConversationHeader`
- `DefaultConversationFooter`
- `DefaultConversationDateGrouping`
- `DefaultConversationItem`

The slots get these props in `defaultProps`:

- `ConversationDrawerHeader` (`IGenAIAssistantConversationDrawerHeaderProps`): the localized `title` of the drawer.
- `ConversationHeader` and `ConversationFooter` (`IGenAIAssistantConversationHeaderProps`, `IGenAIAssistantConversationFooterProps`): the `id` of the conversation group and its `listItems`.
- `ConversationDateGrouping` (`IGenAIAssistantConversationDateGroupingProps`): the `menuGroupItemProps` of the date-group row.
- `ConversationItem` (`IGenAIAssistantConversationItemProps`): the `conversation` and the `menuItemProps` of its row.

```tsx
import {
    GenAIAssistant,
    type IGenAIAssistantConversationHeaderProps,
    type IGenAIAssistantConversationFooterProps,
    type IGenAIAssistantConversationDrawerHeaderProps,
    type IGenAIAssistantConversationItemProps,
    type IGenAIAssistantConversationDateGroupingProps,
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

export const App = () => (
    <GenAIAssistant
        slots={{
            ConversationDrawerHeader: CustomConversationDrawerHeader,
            ConversationHeader: CustomConversationHeader,
            ConversationFooter: CustomConversationFooter,
            ConversationDateGrouping: CustomConversationDateGrouping,
            ConversationItem: CustomConversationItem,
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
- `ConversationKdaContent`: Customizes rendering of Key Driver Analysis parts in multipart content (`@alpha`).

Default components you can reuse:

- `DefaultMessageTextContent`
- `DefaultMessageErrorContent`
- `DefaultMessageReasoningContent`
- `DefaultMessageMultipartContent`
- `DefaultConversationVisualizationContent`
- `DefaultConversationKdaContent`

The slots get these props in `defaultProps`:

- `MessageTextContent`: the `text`, the metadata `objects` rendered as links in it, and `isLoading`.
- `MessageErrorContent`: the error `message`, and optionally its `code`, `reason`, `traceId`, and `isLoading`.
- `MessageReasoningContent`: the reasoning `summary`, the referenced `objects`, and `isLoading`.
- `MessageMultipartContent`: the `message`, its `parts` (text, visualization, dashboard, and so on), the shared `references`, and `isLast`.
- `ConversationVisualizationContent`: the `message`, the `part`, the `visualization` to render, an optional what-if `scenario`, `className`, `menuItems`, and `enableKeyDriverAnalysis` (alpha), which turns explain on charts on or off. It defaults to whether `GenAiKeyDriverAnalysis` is mounted and the workspace setting is on.
- `ConversationKdaContent`: the `kda` definition, `className`, and `enableKeyDriverAnalysis`, with the same default.

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
