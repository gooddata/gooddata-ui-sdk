// (C) 2025-2026 GoodData Corporation

import { type PropsWithChildren, useContext, useMemo } from "react";

import { customizationContext } from "./CustomizationContext.js";
import { DefaultAgentChooser } from "./customized/AgentChooser.js";
import { DefaultAgentItem } from "./customized/AgentItem.js";
import { DefaultAssistantMessage } from "./customized/AssistantMessage.js";
import { DefaultDisclaimer } from "./customized/Disclaimer.js";
import { DefaultFeedback } from "./customized/Feedback.js";
import { DefaultFollowUpButtons } from "./customized/FollowUpButtons.js";
import { DefaultFollowUpQuestion } from "./customized/FollowUpQuestion.js";
import { DefaultLandingScreen } from "./customized/LandingScreen.js";
import { DefaultMessageErrorContent } from "./customized/MessageErrorContent.js";
import { DefaultMessageMultipartContent } from "./customized/MessageMultipartContent.js";
import { DefaultMessageReasoningContent } from "./customized/MessageReasoningContent.js";
import { DefaultMessageTextContent } from "./customized/MessageTextContent.js";
import {
    type IGenAIAssistantAgentChooserProps,
    type IGenAIAssistantAgentItemProps,
    type IGenAIAssistantAssistantMessageProps,
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
import { DefaultUserMessage } from "./customized/UserMessage.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

export type CustomizationProviderProps = {
    slots?: IGenAIAssistantSlots;
};

function LandingScreenSlotRenderer() {
    const { slots } = useContext(customizationContext);
    const { isFullscreen, isBigScreen, isSmallScreen } = useFullscreenCheck();

    const LandingScreenSlot = slots?.LandingScreen;
    const defaultProps = { isFullscreen, isBigScreen, isSmallScreen };

    if (LandingScreenSlot) {
        return <LandingScreenSlot Default={DefaultLandingScreen} defaultProps={defaultProps} />;
    }
    return <DefaultLandingScreen {...defaultProps} />;
}

function DisclaimerSlotRenderer() {
    const { slots } = useContext(customizationContext);
    const DisclaimerSlot = slots?.Disclaimer;
    const defaultProps = {};

    if (DisclaimerSlot) {
        return <DisclaimerSlot Default={DefaultDisclaimer} defaultProps={defaultProps} />;
    }
    return <DefaultDisclaimer />;
}

function AgentItemSlotRenderer(props: IGenAIAssistantAgentItemProps) {
    const { slots } = useContext(customizationContext);
    const AgentItemSlot = slots?.AgentItem;
    const { agent, isSelected, menuItemProps, Content } = props;
    const defaultProps = { agent, isSelected, menuItemProps, Content };

    if (AgentItemSlot) {
        return <AgentItemSlot Default={DefaultAgentItem} defaultProps={defaultProps} />;
    }
    return <DefaultAgentItem {...props} />;
}

function UserMessageSlotRenderer(props: IGenAIAssistantUserMessageProps) {
    const { slots } = useContext(customizationContext);
    const UserMessageSlot = slots?.UserMessage;

    if (UserMessageSlot) {
        return <UserMessageSlot Default={DefaultUserMessage} defaultProps={props} />;
    }
    return <DefaultUserMessage {...props} />;
}

function AssistantMessageSlotRenderer(props: IGenAIAssistantAssistantMessageProps) {
    const { slots } = useContext(customizationContext);
    const AssistantMessageSlot = slots?.AssistantMessage;

    if (AssistantMessageSlot) {
        return <AssistantMessageSlot Default={DefaultAssistantMessage} defaultProps={props} />;
    }
    return <DefaultAssistantMessage {...props} />;
}

function MessageTextContentSlotRenderer(props: IGenAIAssistantMessageTextContentProps) {
    const { slots } = useContext(customizationContext);
    const MessageTextContentSlot = slots?.MessageTextContent;

    if (MessageTextContentSlot) {
        return <MessageTextContentSlot Default={DefaultMessageTextContent} defaultProps={props} />;
    }
    return <DefaultMessageTextContent {...props} />;
}

function MessageErrorContentSlotRenderer(props: IGenAIAssistantMessageErrorContentProps) {
    const { slots } = useContext(customizationContext);
    const MessageErrorContentSlot = slots?.MessageErrorContent;

    if (MessageErrorContentSlot) {
        return <MessageErrorContentSlot Default={DefaultMessageErrorContent} defaultProps={props} />;
    }
    return <DefaultMessageErrorContent {...props} />;
}

function MessageReasoningContentSlotRenderer(props: IGenAIAssistantMessageReasoningContentProps) {
    const { slots } = useContext(customizationContext);
    const MessageReasoningContentSlot = slots?.MessageReasoningContent;

    if (MessageReasoningContentSlot) {
        return <MessageReasoningContentSlot Default={DefaultMessageReasoningContent} defaultProps={props} />;
    }
    return <DefaultMessageReasoningContent {...props} />;
}

function MessageMultipartContentSlotRenderer(props: IGenAIAssistantMessageMultipartContentProps) {
    const { slots } = useContext(customizationContext);
    const MessageMultipartContentSlot = slots?.MessageMultipartContent;

    if (MessageMultipartContentSlot) {
        return <MessageMultipartContentSlot Default={DefaultMessageMultipartContent} defaultProps={props} />;
    }
    return <DefaultMessageMultipartContent {...props} />;
}

function FollowUpButtonsSlotRenderer(props: IGenAIAssistantFollowUpButtonsProps) {
    const { slots } = useContext(customizationContext);
    const FollowUpButtonsSlot = slots?.FollowUpButtons;

    if (FollowUpButtonsSlot) {
        return <FollowUpButtonsSlot Default={DefaultFollowUpButtons} defaultProps={props} />;
    }
    return <DefaultFollowUpButtons {...props} />;
}

function FollowUpQuestionSlotRenderer(props: IGenAIAssistantFollowUpQuestionProps) {
    const { slots } = useContext(customizationContext);
    const FollowUpQuestionSlot = slots?.FollowUpQuestion;

    if (FollowUpQuestionSlot) {
        return <FollowUpQuestionSlot Default={DefaultFollowUpQuestion} defaultProps={props} />;
    }
    return <DefaultFollowUpQuestion {...props} />;
}

function FeedbackSlotRenderer(props: IGenAIAssistantFeedbackProps) {
    const { slots } = useContext(customizationContext);
    const FeedbackSlot = slots?.Feedback;

    if (FeedbackSlot) {
        return <FeedbackSlot Default={DefaultFeedback} defaultProps={props} />;
    }
    return <DefaultFeedback {...props} />;
}

function AgentChooserSlotRenderer(props: IGenAIAssistantAgentChooserProps) {
    const { slots } = useContext(customizationContext);
    const AgentChooserSlot = slots?.AgentChooser;

    if (AgentChooserSlot) {
        return <AgentChooserSlot Default={DefaultAgentChooser} defaultProps={props} />;
    }
    return <DefaultAgentChooser {...props} />;
}

export function CustomizationProvider({ children, slots }: PropsWithChildren<CustomizationProviderProps>) {
    const components = useMemo(
        () => ({
            LandingScreenComponent: LandingScreenSlotRenderer,
            DisclaimerComponent: DisclaimerSlotRenderer,
            AgentItemComponent: AgentItemSlotRenderer,
            UserMessageComponent: UserMessageSlotRenderer,
            AssistantMessageComponent: AssistantMessageSlotRenderer,
            MessageTextContentComponent: MessageTextContentSlotRenderer,
            MessageErrorContentComponent: MessageErrorContentSlotRenderer,
            MessageReasoningContentComponent: MessageReasoningContentSlotRenderer,
            MessageMultipartContentComponent: MessageMultipartContentSlotRenderer,
            FollowUpButtonsComponent: FollowUpButtonsSlotRenderer,
            FollowUpQuestionComponent: FollowUpQuestionSlotRenderer,
            FeedbackComponent: FeedbackSlotRenderer,
            AgentChooserComponent: AgentChooserSlotRenderer,
        }),
        [],
    );

    const value = useMemo(
        () => ({
            slots: slots ?? {},
            components,
        }),
        [slots, components],
    );

    return <customizationContext.Provider value={value}>{children}</customizationContext.Provider>;
}
