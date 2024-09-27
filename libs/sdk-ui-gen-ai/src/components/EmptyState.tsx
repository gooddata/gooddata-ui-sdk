// (C) 2024 GoodData Corporation
import React from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { connect } from "react-redux";
import { makeAssistantTextMessage, makeUserTextMessage } from "../model.js";
import { setMessages } from "../store/index.js";
import { defineMessage, FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";

const quickOptions = [
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-1.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-1.answer" }),
        icon: "gd-icon-magnifier",
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-2.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-2.answer" }),
    },
    {
        title: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        question: defineMessage({ id: "gd.gen-ai.welcome.option-3.title" }),
        answer: defineMessage({ id: "gd.gen-ai.welcome.option-3.answer" }),
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
                    value={intl.formatMessage(option.title)}
                    variant="secondary"
                    iconLeft={option.icon}
                />
            ))}
        </div>
    );
};

const mapDispatchToProps: EmptyStateDispatchProps = {
    setMessages,
};

export const EmptyState = connect(null, mapDispatchToProps)(injectIntl(EmptyStateComponent));
