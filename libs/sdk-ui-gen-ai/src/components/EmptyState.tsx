// (C) 2024-2025 GoodData Corporation
import React from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { Button, Icon } from "@gooddata/sdk-ui-kit";

import { makeAssistantMessage, makeTextContents, makeUserMessage } from "../model.js";
import { setMessagesAction } from "../store/index.js";

const quickOptions = [
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-1.answer" }),
        Icon: Icon.Search,
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-2.answer" }),
        Icon: Icon.NewVisualization,
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-3.answer" }),
        Icon: Icon.ChatBubble,
    },
];

type EmptyStateDispatchProps = {
    setMessagesAction: typeof setMessagesAction;
};

function EmptyStateComponent({ setMessagesAction }: EmptyStateDispatchProps) {
    const intl = useIntl();

    return (
        <div className="gd-gen-ai-chat__messages__empty">
            <h3 className="gd-typography gd-typography--h1">
                <span className="gd-gen-ai-chat__messages__empty__h1--accent">
                    <FormattedMessage id="gd.gen-ai.welcome.line-1" />
                </span>
                <br />
                <FormattedMessage id="gd.gen-ai.welcome.line-2" />
            </h3>
            {quickOptions.map((option) => (
                <Button
                    key={option.title.id}
                    onClick={() =>
                        setMessagesAction({
                            messages: [
                                makeUserMessage([makeTextContents(intl.formatMessage(option.question), [])]),
                                makeAssistantMessage(
                                    [makeTextContents(intl.formatMessage(option.answer), [])],
                                    true,
                                ),
                            ],
                        })
                    }
                    variant="secondary"
                >
                    <span role="presentation" className="gd-gen-ai-chat__messages__empty__icon">
                        <option.Icon width={18} height={18} ariaHidden />
                    </span>
                    <FormattedMessage tagName="span" id={option.title.id} />
                </Button>
            ))}
        </div>
    );
}

const mapDispatchToProps: EmptyStateDispatchProps = {
    setMessagesAction,
};

export const EmptyState: React.FC = connect(null, mapDispatchToProps)(EmptyStateComponent);
