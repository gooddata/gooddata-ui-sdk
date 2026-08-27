// (C) 2024-2026 GoodData Corporation

import { type ComponentType } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { DefaultLandingContainer, DefaultLandingQuestions } from "./LandingContainer.js";
import { DefaultLandingQuestion } from "./LandingQuestion.js";
import { DefaultLandingTitle, DefaultLandingTitleAscent } from "./LandingTitle.js";
import { type IGenAIAssistantLandingScreenProps } from "./types.js";

const quickOptions = [
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-1.answer" }),
        icon: "search",
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-2.answer" }),
        icon: "pieChart",
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-3.answer" }),
        icon: "speechBubble",
    },
] as const;

/**
 * @beta
 */
export type LandingScreenProps = IGenAIAssistantLandingScreenProps & {
    /**
     * Custom React node rendered when no conversation exists yet.
     * @deprecated Use slots.LandingScreen instead.
     */
    LandingScreen?: ComponentType;
};

/**
 * @beta
 */
export function DefaultLandingScreen({
    LandingScreen,
    isBigScreen,
    isSmallScreen,
    isFullscreen,
}: LandingScreenProps) {
    const intl = useIntl();

    return (
        <div className="gd-gen-ai-chat__messages__empty" data-testid="gen-ai-chat-landing-screen">
            {LandingScreen ? (
                <LandingScreen />
            ) : (
                <DefaultLandingContainer
                    isFullscreen={isFullscreen}
                    isBigScreen={isBigScreen}
                    isSmallScreen={isSmallScreen}
                >
                    <DefaultLandingTitle>
                        <DefaultLandingTitleAscent>
                            <FormattedMessage id="gd.gen-ai.welcome.line-1" />
                        </DefaultLandingTitleAscent>
                        <br />
                        <FormattedMessage id="gd.gen-ai.welcome.line-2" />
                    </DefaultLandingTitle>
                    <DefaultLandingQuestions
                        isFullscreen={isFullscreen}
                        isBigScreen={isBigScreen}
                        isSmallScreen={isSmallScreen}
                    >
                        {quickOptions.map((option) => (
                            <DefaultLandingQuestion
                                key={option.title.id}
                                icon={option.icon}
                                title={intl.formatMessage(option.title)}
                                question={intl.formatMessage(option.question)}
                                answer={intl.formatMessage(option.answer)}
                            />
                        ))}
                    </DefaultLandingQuestions>
                </DefaultLandingContainer>
            )}
        </div>
    );
}
