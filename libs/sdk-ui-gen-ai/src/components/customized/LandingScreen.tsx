// (C) 2024-2026 GoodData Corporation

import { type ComponentType, type FC } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { IconChatBubble, IconNewVisualization, IconSearch } from "@gooddata/sdk-ui-kit";

import { DefaultLandingContainer, DefaultLandingQuestions } from "./LandingContainer.js";
import { DefaultLandingQuestion } from "./LandingQuestion.js";
import { DefaultLandingTitle, DefaultLandingTitleAscent } from "./LandingTitle.js";

const quickOptions = [
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-1.answer" }),
        Icon: IconSearch,
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-2.answer" }),
        Icon: IconNewVisualization,
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-3.answer" }),
        Icon: IconChatBubble,
    },
];

/**
 * @beta
 */
export type LandingScreenProps = {
    LandingScreen?: ComponentType;
    isFullscreen?: boolean;
    isBigScreen?: boolean;
    isSmallScreen?: boolean;
};

function LandingScreenComponent({
    LandingScreen,
    isBigScreen,
    isSmallScreen,
    isFullscreen,
}: LandingScreenProps) {
    const intl = useIntl();

    return (
        <div className="gd-gen-ai-chat__messages__empty">
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
                                icon={<option.Icon width={18} height={18} ariaHidden />}
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

/**
 * @beta
 */
export const DefaultLandingScreen: FC<LandingScreenProps> = connect(null, {})(LandingScreenComponent);
