// (C) 2024-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IChatSuggestion } from "@gooddata/sdk-backend-spi";
import { type GenAIChatEffort } from "@gooddata/sdk-model";
import {
    type ISlotProps,
    type IUiMenuInteractiveItemProps,
    type IUiMenuInteractiveItemWrapperProps,
} from "@gooddata/sdk-ui-kit";

import {
    type GenAIAgent,
    type IChatConversationErrorContent,
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type TextContentObject,
} from "../../model.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

/**
 * Properties for the LandingScreen slot.
 * @public
 */
export type IGenAIAssistantLandingScreenProps = {
    /**
     * Whether the chat is in fullscreen mode.
     */
    isFullscreen?: boolean;
    /**
     * Whether the chat is in big screen mode (greater or equal to md)
     */
    isBigScreen?: boolean;
    /**
     * Whether the chat is in small screen mode (less than md)
     */
    isSmallScreen?: boolean;
};

/**
 * Properties for the Disclaimer slot.
 * @public
 */
export type IGenAIAssistantDisclaimerProps = Record<string, never>;

/**
 * Properties for the AgentItem slot.
 * @public
 */
export type IGenAIAssistantAgentItemProps = {
    /**
     * The agent to render.
     */
    agent: GenAIAgent;
    /**
     * Whether the agent is currently selected.
     */
    isSelected: boolean;
    /**
     * Props to pass to the underlying UiMenuInteractiveItemWrapper.
     */
    menuItemProps?: IUiMenuInteractiveItemWrapperProps;
    /**
     * The content to render inside the item.
     */
    Content?: ComponentType<IUiMenuInteractiveItemProps>;
};

/**
 * Properties for the UserMessage slot.
 * @alpha
 */
export type IGenAIAssistantUserMessageProps = {
    /**
     * The message to render.
     */
    message: IChatConversationLocalItem;
    /**
     * The groups of messages in the conversation.
     */
    groups: IChatMessagesGroup[];
    /**
     * Whether the message is the last one in the conversation.
     */
    isLast?: boolean;
};

/**
 * Properties for the AssistantMessage slot.
 * @alpha
 */
export type IGenAIAssistantAssistantMessageProps = {
    /**
     * The message to render.
     */
    message: IChatConversationLocalItem;
    /**
     * The groups of messages in the conversation.
     */
    groups: IChatMessagesGroup[];
    /**
     * Whether the message is the last one in the conversation.
     */
    isLast?: boolean;
};

/**
 * Properties for the MessageTextContent slot.
 * @alpha
 */
export type IGenAIAssistantMessageTextContentProps = {
    /**
     * The text to render.
     */
    text: string;
    /**
     * The objects to render as links in the text.
     */
    objects: TextContentObject[];
    /**
     * Whether the message is still loading.
     */
    isLoading?: boolean;
};

/**
 * Properties for the MessageErrorContent slot.
 * @alpha
 */
export type IGenAIAssistantMessageErrorContentProps = IChatConversationErrorContent & {
    /**
     * Whether the message is still loading.
     */
    isLoading?: boolean;
};

/**
 * Properties for the MessageReasoningContent slot.
 * @alpha
 */
export type IGenAIAssistantMessageReasoningContentProps = {
    /**
     * The summary of the reasoning.
     */
    summary: string;
    /**
     * The objects to render as links in the reasoning.
     */
    objects: TextContentObject[];
    /**
     * Whether the message is still loading.
     */
    isLoading?: boolean;
};

/**
 * Properties for the MessageMultipartContent slot.
 * @alpha
 */
export type IGenAIAssistantMessageMultipartContentProps = {
    /**
     * The message containing the multipart content.
     */
    message: IChatConversationLocalItem;
    /**
     * The parts of the multipart content.
     */
    parts: IChatConversationMultipartLocalPart[];
    /**
     * The references to metadata objects.
     */
    references: TextContentObject[];
};

/**
 * Properties for the FollowUpButtons slot.
 * @alpha
 */
export type IGenAIAssistantFollowUpButtonsProps = {
    /**
     * The message to render follow up buttons for.
     */
    message: IChatConversationLocalItem;
    /**
     * The suggestions for follow up questions.
     */
    suggestions: IChatSuggestion[];
};

/**
 * Properties for the FollowUpQuestion slot.
 * @alpha
 */
export type IGenAIAssistantFollowUpQuestionProps = {
    /**
     * The message to render follow up question for.
     */
    message: IChatConversationLocalItem;
    /**
     * The follow up question text.
     */
    question: string;
    /**
     * The references to metadata objects.
     */
    references: TextContentObject[];
};

/**
 * Properties for the Feedback slot.
 * @alpha
 */
export type IGenAIAssistantFeedbackProps = {
    /**
     * The message to render feedback buttons for.
     */
    message: IChatConversationLocalItem;
    /**
     * The groups of messages in the conversation.
     */
    group: IChatMessagesGroup;
    /**
     * Whether the message is the last one in the conversation.
     */
    isLast?: boolean;
    /**
     * Whether the feedback is hidden.
     */
    isHidden?: boolean;
    /**
     * Whether the related message is complete.
     */
    isComplete?: boolean;
};

/**
 * Properties for the AgentChooser slot.
 * @alpha
 */
export type IGenAIAssistantAgentChooserProps = {
    /**
     * The available agents to choose from.
     */
    agents: GenAIAgent[];
    /**
     * The conversations in the chat history.
     */
    conversations?: IChatConversationLocal[];
    /**
     * The agent id associated with the current conversation.
     */
    conversationAgentId?: string;
    /**
     * The currently selected agent id.
     */
    selectedAgentId?: string;
    /**
     * The effective selected agent id, taking into account the current conversation and available agents.
     */
    effectiveSelectedAgentId?: string;
    /**
     * Callback when an agent is selected.
     */
    onSelectAgent: (agentId: string | undefined, options?: { showChangeEvent?: boolean }) => void;
    /**
     * The currently selected reasoning effort.
     */
    selectedEffort?: GenAIChatEffort;
    /**
     * Callback when a reasoning effort is selected.
     */
    onSelectEffort?: (effort: GenAIChatEffort) => void;
    /**
     * Whether the agent chooser is disabled.
     */
    isDisabled?: boolean;
    /**
     * Whether the agent chooser is loading.
     */
    isLoading?: boolean;
};

/**
 * Customizations for the Gen AI assistant.
 * @public
 */
export interface IGenAIAssistantSlots {
    /**
     * Custom React node rendered when no conversation exists yet or user has click
     * on "New conversation" button.
     */
    LandingScreen?: ComponentType<ISlotProps<IGenAIAssistantLandingScreenProps>>;

    /**
     * Custom React component rendered below the input as a disclaimer.
     */
    Disclaimer?: ComponentType<ISlotProps<IGenAIAssistantDisclaimerProps>>;

    /**
     * Custom React component rendered for each agent in the agent chooser dropdown.
     */
    AgentItem?: ComponentType<ISlotProps<IGenAIAssistantAgentItemProps>>;

    /**
     * @alpha
     * Custom React component rendered for each user message.
     */
    UserMessage?: ComponentType<ISlotProps<IGenAIAssistantUserMessageProps>>;

    /**
     * @alpha
     * Custom React component rendered for each assistant message.
     */
    AssistantMessage?: ComponentType<ISlotProps<IGenAIAssistantAssistantMessageProps>>;

    /**
     * @alpha
     * Custom React component rendered for text content of a message.
     */
    MessageTextContent?: ComponentType<ISlotProps<IGenAIAssistantMessageTextContentProps>>;

    /**
     * @alpha
     * Custom React component rendered for error content of a message.
     */
    MessageErrorContent?: ComponentType<ISlotProps<IGenAIAssistantMessageErrorContentProps>>;

    /**
     * @alpha
     * Custom React component rendered for reasoning content of a message.
     */
    MessageReasoningContent?: ComponentType<ISlotProps<IGenAIAssistantMessageReasoningContentProps>>;

    /**
     * @alpha
     * Custom React component rendered for multipart content of a message.
     */
    MessageMultipartContent?: ComponentType<ISlotProps<IGenAIAssistantMessageMultipartContentProps>>;

    /**
     * @alpha
     * Custom React component rendered for follow up buttons of a message.
     */
    FollowUpButtons?: ComponentType<ISlotProps<IGenAIAssistantFollowUpButtonsProps>>;

    /**
     * @alpha
     * Custom React component rendered for feedback buttons of a message.
     */
    Feedback?: ComponentType<ISlotProps<IGenAIAssistantFeedbackProps>>;

    /**
     * @alpha
     * Custom React component rendered for follow up question of a message.
     */
    FollowUpQuestion?: ComponentType<ISlotProps<IGenAIAssistantFollowUpQuestionProps>>;

    /**
     * @alpha
     * Custom React component rendered for the agent chooser.
     */
    AgentChooser?: ComponentType<ISlotProps<IGenAIAssistantAgentChooserProps>>;
}
