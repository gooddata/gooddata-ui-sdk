// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useMemo, useState } from "react";

import cx from "classnames";
import { type IntlShape, defineMessages, useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import { type IChatMessagesGroup } from "../utils/groupUtility.js";
import { removeMarkdown } from "../utils/markdownUtils.js";

interface IItemsGroupProps {
    previousGroup?: IChatMessagesGroup;
    group: IChatMessagesGroup;
    children: ReactNode;
}

export function ItemsGroup({ group, previousGroup, children }: IItemsGroupProps) {
    const classNames = cx("gd-gen-ai-chat__messages__conversation-group", {
        [`gd-gen-ai-chat__messages__conversation-group--${group.type}`]: true,
    });

    if (group.type === "reasoning") {
        return (
            <ReasoningItemsGroup classNames={classNames} previousGroup={previousGroup} group={group}>
                {children}
            </ReasoningItemsGroup>
        );
    }

    return (
        <DefaultItemsGroup classNames={classNames} group={group}>
            {children}
        </DefaultItemsGroup>
    );
}

//REASONING GROUP

interface IReasoningItemsGroupProps extends IItemsGroupProps {
    classNames: string;
}

function ReasoningItemsGroup({ classNames, group, previousGroup, children }: IReasoningItemsGroupProps) {
    const { lastMessage, isExpanded, setIsExpanded, isCompleted, isEmpty, duration } = useReasoningGroup(
        previousGroup,
        group,
    );

    return (
        <div
            className={cx(classNames, {
                "gd-gen-ai-chat__messages__conversation-group--completed": isCompleted,
            })}
        >
            <div
                className={cx("gd-gen-ai-chat__messages__conversation-group--header", {
                    "gd-gen-ai-chat__messages__conversation-group--header--completed": isCompleted,
                })}
            >
                <span className="gd-gen-ai-chat__visually__hidden" aria-live="polite" aria-atomic="true">
                    {lastMessage}
                </span>
                {isCompleted && isEmpty ? (
                    <UiButton
                        isDisabled
                        label={lastMessage}
                        accessibilityConfig={{ ariaExpanded: false }}
                        iconBefore="brain"
                        iconBeforeSize={12}
                        variant="tertiary"
                    />
                ) : (
                    <UiButton
                        label={lastMessage}
                        onClick={() => setIsExpanded(!isExpanded)}
                        accessibilityConfig={{ ariaExpanded: isExpanded }}
                        iconBefore={isExpanded ? "navigateDown" : "navigateRight"}
                        iconBeforeSize={12}
                        variant="tertiary"
                    />
                )}
                {isCompleted && duration ? (
                    <div className="gd-gen-ai-chat__messages__conversation-group--header--duration">
                        {duration}
                    </div>
                ) : null}
            </div>
            {isExpanded ? (
                <div className="gd-gen-ai-chat__messages__conversation-group--content">{children}</div>
            ) : null}
        </div>
    );
}

function useReasoningGroup(previousGroup: IChatMessagesGroup | undefined, group: IChatMessagesGroup) {
    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);

    const isCompleted = useMemo(() => {
        return group.messages.every((m) => m.complete || m.cancelled);
    }, [group.messages]);

    const isEmpty = useMemo(() => {
        return (
            group.messages.length === 0 ||
            group.messages.every((m) => {
                if (m.content.type === "reasoning") {
                    return !m.content.summary;
                }
                if (m.content.type === "text") {
                    return !m.content.text;
                }
                return false;
            })
        );
    }, [group.messages]);

    const messages = useMemo(() => {
        return group.messages.map((m) => {
            if (m.complete) {
                return undefined;
            }
            switch (m.content.type) {
                case "reasoning":
                    return m.content.summary
                        ? removeMarkdown(m.content.summary.slice(0, 40))
                        : intl.formatMessage({ id: "gd.gen-ai.state.thinking" });
                case "toolCall":
                    return intl.formatMessage(
                        { id: "gd.gen-ai.message.reasoning.tool-call.plain" },
                        { name: m.content.name },
                    );
                case "toolResult":
                    return intl.formatMessage({ id: "gd.gen-ai.message.reasoning.tool-result.plain" });
                default:
                    return undefined;
            }
        });
    }, [group.messages, intl]);

    const lastMessage = useMemo(() => {
        if (isCompleted) {
            return intl.formatMessage({ id: "gd.gen-ai.routing.thinking-process" });
        }

        const lastMessageContent = messages[messages.length - 1];
        return `${lastMessageContent ?? intl.formatMessage({ id: "gd.gen-ai.state.thinking" })}...`;
    }, [intl, isCompleted, messages]);

    const duration = useMemo(() => {
        if (!previousGroup) {
            return undefined;
        }
        const previousLastMessage = previousGroup.messages[previousGroup.messages.length - 1];
        const lastMessage = group.messages[group.messages.length - 1];
        if (!previousLastMessage || !lastMessage) {
            return undefined;
        }

        const duration = Math.abs(lastMessage.createdAt - previousLastMessage.createdAt);
        return formatDuration(intl, duration);
    }, [group.messages, intl, previousGroup]);

    return {
        duration,
        lastMessage,
        isEmpty,
        isCompleted,
        isExpanded,
        setIsExpanded,
    };
}

//duration

function formatDuration(intl: IntlShape, ms: number): string {
    const messages = defineMessages({
        seconds: { id: "gd.gen-ai.state.seconds" },
        minutes: { id: "gd.gen-ai.state.minutes" },
    });

    const seconds = ms / 1000;

    if (seconds < 60) {
        return `${seconds}${intl.formatMessage(messages.seconds)}`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}${intl.formatMessage(messages.minutes)} ${remainingSeconds}${intl.formatMessage(messages.seconds)}`;
}

//DEFAULT GROUP

interface IDefaultItemsGroupProps extends IItemsGroupProps {
    classNames: string;
}

function DefaultItemsGroup({ classNames, children }: IDefaultItemsGroupProps) {
    return <div className={classNames}>{children}</div>;
}
