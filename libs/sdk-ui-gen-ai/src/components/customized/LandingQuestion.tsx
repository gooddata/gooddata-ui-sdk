// (C) 2025-2026 GoodData Corporation

import { type FC, type ReactNode } from "react";

import { connect } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { makeAssistantMessage, makeTextContents, makeUserMessage } from "../../model.js";
import { setMessagesAction } from "../../store/index.js";
import { escapeMarkdown } from "../utils/markdownUtils.js";

interface ILandingQuestionActionsProps {
    setMessagesAction: typeof setMessagesAction;
}

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
    icon,
    question,
    answer,
    title = question,
}: ILandingQuestionProps & ILandingQuestionActionsProps) {
    return (
        <Button
            onClick={() =>
                setMessagesAction({
                    messages: [
                        makeUserMessage([makeTextContents(escapeMarkdown(question), [])]),
                        makeAssistantMessage([makeTextContents(escapeMarkdown(answer), [])], true),
                    ],
                })
            }
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
}

const mapDispatchToProps: ILandingQuestionActionsProps = {
    setMessagesAction,
};

/**
 * @beta
 */
export const DefaultLandingQuestion: FC<ILandingQuestionProps> = connect(
    null,
    mapDispatchToProps,
)(LandingQuestionComponent);
