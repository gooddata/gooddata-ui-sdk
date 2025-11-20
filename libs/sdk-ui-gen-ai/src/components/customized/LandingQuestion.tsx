// (C) 2025 GoodData Corporation

import { FC, ReactNode } from "react";

import { connect } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { makeAssistantMessage, makeTextContents, makeUserMessage } from "../../model.js";
import { setMessagesAction } from "../../store/index.js";
import { escapeMarkdown } from "../utils/markdownUtils.js";

interface LandingQuestionActionsProps {
    setMessagesAction: typeof setMessagesAction;
}

/**
 * @beta
 */
export interface LandingQuestionProps {
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
}: LandingQuestionProps & LandingQuestionActionsProps) {
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
            {title}
        </Button>
    );
}

const mapDispatchToProps: LandingQuestionActionsProps = {
    setMessagesAction,
};

/**
 * @beta
 */
export const DefaultLandingQuestion: FC<LandingQuestionProps> = connect(
    null,
    mapDispatchToProps,
)(LandingQuestionComponent);
