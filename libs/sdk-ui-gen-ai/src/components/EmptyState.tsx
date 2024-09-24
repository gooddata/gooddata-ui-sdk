// (C) 2024 GoodData Corporation
import React from "react";
import { Button, IButtonProps, Typography } from "@gooddata/sdk-ui-kit";
import { useDispatch } from "react-redux";
import { makeAssistantTextMessage, makeUserTextMessage } from "../model.js";
import { setMessages } from "../store/index.js";

type QuickOption = {
    title: string;
    question: string;
    answer: string;
    icon?: string;
};

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

export const EmptyState: React.FC = () => {
    const dispatch = useDispatch();

    const withClickValue = (option: QuickOption): IButtonProps => ({
        onClick: () => {
            dispatch(
                setMessages([makeUserTextMessage(option.question), makeAssistantTextMessage(option.answer)]),
            );
        },
        value: option.title,
        variant: "secondary" as const,
        iconLeft: option.icon,
    });

    return (
        <div className="gd-gen-ai-chat__messages__empty">
            <Typography tagName="h1" className="gd-gen-ai-chat__messages__empty__h1--accent">
                Hi there,
            </Typography>
            <Typography tagName="h1">How can I help you?</Typography>
            {quickOptions.map((option) => (
                <Button key={option.title} {...withClickValue(option)} />
            ))}
        </div>
    );
};
