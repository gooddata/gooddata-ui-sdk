// (C) 2025-2026 GoodData Corporation

import { type PropsWithChildren, useContext, useMemo } from "react";

import { customizationContext } from "./CustomizationContext.js";
import { DefaultAgentChooser } from "./customized/AgentChooser.js";
import { DefaultAgentItem } from "./customized/AgentItem.js";
import { DefaultAssistantMessage } from "./customized/AssistantMessage.js";
import { DefaultConversationDateGrouping } from "./customized/ConversationDateGrouping.js";
import { DefaultConversationDrawerHeader } from "./customized/ConversationDrawerHeader.js";
import { DefaultConversationFooter } from "./customized/ConversationFooter.js";
import { DefaultConversationHeader } from "./customized/ConversationHeader.js";
import { DefaultConversationItem } from "./customized/ConversationItem.js";
import { DefaultConversationVisualizationContent } from "./customized/ConversationVisualizationContent.js";
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

function ConversationItemSlotRenderer(props: IGenAIAssistantConversationItemProps) {
    const { slots } = useContext(customizationContext);
    const ConversationItemSlot = slots?.ConversationItem;

    if (ConversationItemSlot) {
        return <ConversationItemSlot Default={DefaultConversationItem} defaultProps={props} />;
    }
    return <DefaultConversationItem {...props} />;
}

function ConversationHeaderSlotRenderer(props: IGenAIAssistantConversationHeaderProps) {
    const { slots } = useContext(customizationContext);
    const ConversationHeaderSlot = slots?.ConversationHeader;

    if (ConversationHeaderSlot) {
        return <ConversationHeaderSlot Default={DefaultConversationHeader} defaultProps={props} />;
    }
    return <DefaultConversationHeader {...props} />;
}

function ConversationDrawerHeaderSlotRenderer(props: IGenAIAssistantConversationDrawerHeaderProps) {
    const { slots } = useContext(customizationContext);
    const ConversationDrawerHeaderSlot = slots?.ConversationDrawerHeader;

    if (ConversationDrawerHeaderSlot) {
        return (
            <ConversationDrawerHeaderSlot Default={DefaultConversationDrawerHeader} defaultProps={props} />
        );
    }
    return <DefaultConversationDrawerHeader {...props} />;
}

function ConversationFooterSlotRenderer(props: IGenAIAssistantConversationFooterProps) {
    const { slots } = useContext(customizationContext);
    const ConversationFooterSlot = slots?.ConversationFooter;

    if (ConversationFooterSlot) {
        return <ConversationFooterSlot Default={DefaultConversationFooter} defaultProps={props} />;
    }
    return <DefaultConversationFooter {...props} />;
}

function ConversationDateGroupingSlotRenderer(props: IGenAIAssistantConversationDateGroupingProps) {
    const { slots } = useContext(customizationContext);
    const ConversationDateGroupingSlot = slots?.ConversationDateGrouping;

    if (ConversationDateGroupingSlot) {
        return (
            <ConversationDateGroupingSlot Default={DefaultConversationDateGrouping} defaultProps={props} />
        );
    }
    return <DefaultConversationDateGrouping {...props} />;
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

function ConversationVisualizationContentSlotRenderer(
    props: IGenAIAssistantConversationVisualizationContentProps,
) {
    const { slots } = useContext(customizationContext);
    const ConversationVisualizationContentSlot = slots?.ConversationVisualizationContent;

    if (ConversationVisualizationContentSlot) {
        return (
            <ConversationVisualizationContentSlot
                Default={DefaultConversationVisualizationContent}
                defaultProps={props}
            />
        );
    }
    return <DefaultConversationVisualizationContent {...props} />;
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
            ConversationItemComponent: ConversationItemSlotRenderer,
            ConversationDrawerHeaderComponent: ConversationDrawerHeaderSlotRenderer,
            ConversationHeaderComponent: ConversationHeaderSlotRenderer,
            ConversationFooterComponent: ConversationFooterSlotRenderer,
            ConversationDateGroupingComponent: ConversationDateGroupingSlotRenderer,
            UserMessageComponent: UserMessageSlotRenderer,
            AssistantMessageComponent: AssistantMessageSlotRenderer,
            MessageTextContentComponent: MessageTextContentSlotRenderer,
            MessageErrorContentComponent: MessageErrorContentSlotRenderer,
            MessageReasoningContentComponent: MessageReasoningContentSlotRenderer,
            MessageMultipartContentComponent: MessageMultipartContentSlotRenderer,
            ConversationVisualizationContentComponent: ConversationVisualizationContentSlotRenderer,
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
