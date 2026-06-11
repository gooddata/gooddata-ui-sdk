// (C) 2025-2026 GoodData Corporation

import { type FC, type ReactNode } from "react";

import { defineMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { Button, UiTooltip } from "@gooddata/sdk-ui-kit";

import {
    makeAssistantItem,
    makeAssistantMessage,
    makeTextContents,
    makeUserItem,
    makeUserMessage,
} from "../../model.js";
import { agentSwitchingActiveSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { agentsAvailableSelector } from "../../store/messages/messagesSelectors.js";
import { setMessagesAction } from "../../store/messages/messagesSlice.js";
import { type RootState } from "../../store/types.js";
import { escapeMarkdown } from "../utils/markdownUtils.js";

interface ILandingQuestionActionsProps {
    setMessagesAction: typeof setMessagesAction;
}

interface ILandingQuestionStateProps {
    agentSwitchingActive: ReturnType<typeof agentSwitchingActiveSelector>;
    agentsAvailable: ReturnType<typeof agentsAvailableSelector>;
}

const disabledTooltip = defineMessage({ id: "gd.gen-ai.agent.unavailable.disabled-tooltip" });

/**
 * @beta
 */
export interface ILandingQuestionProps {
    question: string;
    answer: string;
    icon?: ReactNode;
    title?: string;
}

/**
 * @beta
 */
function LandingQuestionComponent({
    setMessagesAction,
    agentSwitchingActive,
    agentsAvailable,
    icon,
    question,
    answer,
    title = question,
}: ILandingQuestionProps & ILandingQuestionActionsProps & ILandingQuestionStateProps) {
    const intl = useIntl();
    const isDisabled = agentSwitchingActive && agentsAvailable !== true;

    const button = (
        <Button
            disabled={isDisabled}
            onClick={() => {
                if (isDisabled) {
                    return;
                }

                setMessagesAction({
                    messages: [
                        makeUserMessage([makeTextContents(escapeMarkdown(question), [])]),
                        makeAssistantMessage([makeTextContents(escapeMarkdown(answer), [])], true),
                    ],
                    items: [
                        makeUserItem({ type: "text", text: escapeMarkdown(question) }),
                        makeAssistantItem({ type: "text", text: escapeMarkdown(answer) }, "", true),
                    ],
                });
            }}
            variant="secondary"
        >
            {icon ? (
                <span role="presentation" className="gd-gen-ai-chat__messages__empty__icon">
                    {icon}
                </span>
            ) : null}
            <span className="gd-gen-ai-chat__messages__empty__text">{title}</span>
        </Button>
    );

    if (!isDisabled) {
        return button;
    }

    return (
        <UiTooltip
            triggerBy={["focus", "hover"]}
            arrowPlacement="bottom"
            anchor={
                <span tabIndex={0} aria-disabled className="gd-gen-ai-chat__messages__empty__tooltip">
                    {button}
                </span>
            }
            content={intl.formatMessage(disabledTooltip)}
        />
    );
}

const mapStateToProps = (state: RootState): ILandingQuestionStateProps => ({
    agentSwitchingActive: agentSwitchingActiveSelector(state),
    agentsAvailable: agentsAvailableSelector(state),
});

const mapDispatchToProps: ILandingQuestionActionsProps = {
    setMessagesAction,
};

/**
 * @beta
 */
export const DefaultLandingQuestion: FC<ILandingQuestionProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(LandingQuestionComponent);
