// (C) 2024-2025 GoodData Corporation

import { ComponentType, FC } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { IconChatBubble, IconNewVisualization, IconSearch } from "@gooddata/sdk-ui-kit";

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
};

function LandingScreenComponent({ LandingScreen }: LandingScreenProps) {
    const intl = useIntl();

    return (
        <div className="gd-gen-ai-chat__messages__empty">
            {LandingScreen ? (
                <LandingScreen />
            ) : (
                <>
                    <DefaultLandingTitle>
                        <DefaultLandingTitleAscent>
                            <FormattedMessage id="gd.gen-ai.welcome.line-1" />
                        </DefaultLandingTitleAscent>
                        <br />
                        <FormattedMessage id="gd.gen-ai.welcome.line-2" />
                    </DefaultLandingTitle>
                    {quickOptions.map((option) => (
                        <DefaultLandingQuestion
                            key={option.title.id}
                            icon={<option.Icon width={18} height={18} ariaHidden />}
                            title={intl.formatMessage(option.title)}
                            question={intl.formatMessage(option.question)}
                            answer={intl.formatMessage(option.answer)}
                        />
                    ))}
                </>
            )}
        </div>
    );
}

/**
 * @beta
 */
export const DefaultLandingScreen: FC<LandingScreenProps> = connect(null, {})(LandingScreenComponent);
