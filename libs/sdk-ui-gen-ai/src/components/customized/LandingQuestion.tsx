// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IUiButtonProps, UiButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import {
    makeAssistantItem,
    makeAssistantMessage,
    makeTextContents,
    makeUserItem,
    makeUserMessage,
} from "../../model.js";
import { agentSwitchingActiveSelector } from "../../store/chatWindow/chatWindowSelectors.js";
import { agentsAvailableSelector } from "../../store/messages/messagesSelectors.js";
import { setMessagesAction as setMessagesActionCreator } from "../../store/messages/messagesSlice.js";
import { escapeMarkdown } from "../utils/markdownUtils.js";

const disabledTooltip = defineMessage({ id: "gd.gen-ai.agent.unavailable.disabled-tooltip" });

/**
 * Default implementation of the LandingQuestion slot.
 *
 * @alpha
 */
export interface ILandingQuestionProps {
    question: string;
    answer: string;
    icon?: IUiButtonProps["iconBefore"];
    title?: string;
}

/**
 * Default implementation of the LandingQuestion slot.
 *
 * @alpha
 */
export function DefaultLandingQuestion({ icon, question, answer, title = question }: ILandingQuestionProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const agentSwitchingActive = useSelector(agentSwitchingActiveSelector);
    const agentsAvailable = useSelector(agentsAvailableSelector);

    const setMessagesAction = useCallback(
        (...args: Parameters<typeof setMessagesActionCreator>) => dispatch(setMessagesActionCreator(...args)),
        [dispatch],
    );

    const isDisabled = agentSwitchingActive && agentsAvailable !== true;

    const button = (
        <UiButton
            isDisabled={isDisabled}
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
            size="medium"
            iconBefore={icon}
            label={title}
        />
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
