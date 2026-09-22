// (C) 2025-2026 GoodData Corporation

import { type ComponentType, createContext, useContext } from "react";

import {
    type IGenAIAssistantAgentChooserProps,
    type IGenAIAssistantAgentItemProps,
    type IGenAIAssistantAssistantMessageProps,
    type IGenAIAssistantConversationDateGroupingProps,
    type IGenAIAssistantConversationDrawerHeaderProps,
    type IGenAIAssistantConversationFooterProps,
    type IGenAIAssistantConversationHeaderProps,
    type IGenAIAssistantConversationItemProps,
    type IGenAIAssistantConversationVisualizationContentProps,
    type IGenAIAssistantFeedbackProps,
    type IGenAIAssistantFollowUpButtonsProps,
    type IGenAIAssistantFollowUpQuestionProps,
    type IGenAIAssistantMessageErrorContentProps,
    type IGenAIAssistantMessageMultipartContentProps,
    type IGenAIAssistantMessageReasoningContentProps,
    type IGenAIAssistantMessageTextContentProps,
    type IGenAIAssistantSlots,
    type IGenAIAssistantUserMessageProps,
} from "./customized/types.js";

/**
 * @internal
 */
export interface IGenAIAssistantComponents {
    LandingScreenComponent: ComponentType;
    DisclaimerComponent: ComponentType;
    AgentItemComponent: ComponentType<IGenAIAssistantAgentItemProps>;
    ConversationItemComponent: ComponentType<IGenAIAssistantConversationItemProps>;
    ConversationDrawerHeaderComponent: ComponentType<IGenAIAssistantConversationDrawerHeaderProps>;
    ConversationHeaderComponent: ComponentType<IGenAIAssistantConversationHeaderProps>;
    ConversationFooterComponent: ComponentType<IGenAIAssistantConversationFooterProps>;
    ConversationDateGroupingComponent: ComponentType<IGenAIAssistantConversationDateGroupingProps>;
    UserMessageComponent: ComponentType<IGenAIAssistantUserMessageProps>;
    AssistantMessageComponent: ComponentType<IGenAIAssistantAssistantMessageProps>;
    MessageTextContentComponent: ComponentType<IGenAIAssistantMessageTextContentProps>;
    MessageErrorContentComponent: ComponentType<IGenAIAssistantMessageErrorContentProps>;
    MessageReasoningContentComponent: ComponentType<IGenAIAssistantMessageReasoningContentProps>;
    MessageMultipartContentComponent: ComponentType<IGenAIAssistantMessageMultipartContentProps>;
    ConversationVisualizationContentComponent: ComponentType<IGenAIAssistantConversationVisualizationContentProps>;
    FollowUpButtonsComponent: ComponentType<IGenAIAssistantFollowUpButtonsProps>;
    FollowUpQuestionComponent: ComponentType<IGenAIAssistantFollowUpQuestionProps>;
    FeedbackComponent: ComponentType<IGenAIAssistantFeedbackProps>;
    AgentChooserComponent: ComponentType<IGenAIAssistantAgentChooserProps>;
}

/**
 * @internal
 */
export type CustomizationContext = {
    slots?: IGenAIAssistantSlots;
    components?: IGenAIAssistantComponents;
};

/**
 * @internal
 */
export const customizationContext = createContext<CustomizationContext>({
    slots: {},
});

/**
 * @internal
 */
export const useCustomization = () => {
    const { components } = useContext(customizationContext);
    if (!components) {
        throw new Error("useCustomization must be used within a CustomizationProvider");
    }
    return components;
};
