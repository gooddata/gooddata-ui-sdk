// (C) 2024 GoodData Corporation
import React from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { connect } from "react-redux";
import { makeAssistantTextMessage, makeUserTextMessage } from "../model.js";
import { setMessages } from "../store/index.js";

const quickOptions = [
    {
        title: "Search for a dashboard or visualization",
        question: "Search for a dashboard or visualization",
        answer: "Sure thing, what kind of dashboard or visualization would you like to see?",
        icon: "gd-icon-magnifier",
    },
    {
        title: "Create a new visualization",
        question: "Create a new visualization",
        answer: "Sure thing, what kind of visualization would you like to create?",
    },
    {
        title: "Answer business question",
        question: "Answer business question",
        answer: "Sure thing, what business question would you like to answer?",
    },
];

type EmptyStateDispatchProps = {
    setMessages: typeof setMessages;
};

const EmptyStateComponent: React.FC<EmptyStateDispatchProps> = ({ setMessages }) => {
    return (
        <div className="gd-gen-ai-chat__messages__empty">
            <Typography tagName="h1" className="gd-gen-ai-chat__messages__empty__h1--accent">
                Hi there,
            </Typography>
            <Typography tagName="h1">How can I help you?</Typography>
            {quickOptions.map((option) => (
                <Button
                    key={option.title}
                    onClick={() =>
                        setMessages([
                            makeUserTextMessage(option.question),
                            makeAssistantTextMessage(option.answer),
                        ])
                    }
                    value={option.title}
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

export const EmptyState = connect(null, mapDispatchToProps)(EmptyStateComponent);
