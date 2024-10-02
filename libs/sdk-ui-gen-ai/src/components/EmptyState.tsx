// (C) 2024 GoodData Corporation
import React from "react";
import { Button, Icon, Typography } from "@gooddata/sdk-ui-kit";
import { connect } from "react-redux";
import { makeAssistantTextMessage, makeUserTextMessage } from "../model.js";
import { setMessages } from "../store/index.js";
import { defineMessage, FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";

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
    setMessages: typeof setMessages;
};

const EmptyStateComponent: React.FC<EmptyStateDispatchProps & WrappedComponentProps> = ({
    setMessages,
    intl,
}) => {
    return (
        <div className="gd-gen-ai-chat__messages__empty">
            <Typography tagName="h1" className="gd-gen-ai-chat__messages__empty__h1--accent">
                <FormattedMessage id="gd.gen-ai.welcome.line-1" />
            </Typography>
            <Typography tagName="h1">
                <FormattedMessage id="gd.gen-ai.welcome.line-2" />
            </Typography>
            {quickOptions.map((option) => (
                <Button
                    key={option.title.id}
                    onClick={() =>
                        setMessages([
                            makeUserTextMessage(intl.formatMessage(option.question)),
                            makeAssistantTextMessage(intl.formatMessage(option.answer)),
                        ])
                    }
                    variant="secondary"
                >
                    <option.Icon width={18} height={18} />
                    <FormattedMessage tagName="span" id={option.title.id} />
                </Button>
            ))}
        </div>
    );
};

const mapDispatchToProps: EmptyStateDispatchProps = {
    setMessages,
};

export const EmptyState = connect(null, mapDispatchToProps)(injectIntl(EmptyStateComponent));
