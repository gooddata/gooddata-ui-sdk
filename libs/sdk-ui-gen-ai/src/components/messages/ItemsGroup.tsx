// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useMemo, useState } from "react";

import cx from "classnames";
import { type IntlShape, defineMessages, useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import { AIThinkingLoader, AIThinkingSummary } from "../utils/animation.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";
import { extractHeading } from "../utils/markdownUtils.js";

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

    if (group.type === "system") {
        return <>{children}</>;
    }

    return (
        <DefaultItemsGroup classNames={classNames} previousGroup={previousGroup} group={group}>
            {children}
        </DefaultItemsGroup>
    );
}

//REASONING GROUP

interface IReasoningItemsGroupProps extends IItemsGroupProps {
    classNames: string;
}

function ReasoningItemsGroup({ classNames, group, previousGroup, children }: IReasoningItemsGroupProps) {
    const intl = useIntl();
    const { headings, isExpanded, setIsExpanded, isCompleted, isEmpty, duration } = useReasoningGroup(
        previousGroup,
        group,
    );

    if (isCompleted && isEmpty) {
        return null;
    }

    return (
        <div
            className={cx(classNames, {
                "gd-gen-ai-chat__messages__conversation-group--completed": isCompleted,
                "gd-gen-ai-chat__messages__conversation-group--expanded": isExpanded,
            })}
        >
            <div
                className={cx("gd-gen-ai-chat__messages__conversation-group--header", {
                    "gd-gen-ai-chat__messages__conversation-group--header--completed": isCompleted,
                })}
            >
                <span className="gd-gen-ai-chat__visually__hidden" aria-live="polite" aria-atomic="true">
                    {headings[headings.length - 1]}
                </span>
                {isCompleted ? (
                    <UiButton
                        label={intl.formatMessage({ id: "gd.gen-ai.routing.thinking-process" })}
                        dataTestId="reasoning"
                        onClick={() => setIsExpanded(!isExpanded)}
                        accessibilityConfig={{ ariaExpanded: isExpanded }}
                        iconBefore={isExpanded ? "navigateDown" : "navigateRight"}
                        iconBeforeSize={12}
                        variant="tertiary"
                    />
                ) : (
                    <div
                        className="gd-gen-ai-chat__messages__conversation-group--header--thinking"
                        data-testid="reasoning"
                    >
                        <AIThinkingLoader size={30} />
                        <AIThinkingSummary headings={headings} />
                    </div>
                )}
                {isCompleted && duration ? (
                    <div className="gd-gen-ai-chat__messages__conversation-group--header--duration">
                        {duration}
                    </div>
                ) : null}
            </div>
            {isExpanded ? (
                <div
                    className="gd-gen-ai-chat__messages__conversation-group--content"
                    data-testid="gen-ai-reasoning-group-content"
                >
                    {children}
                </div>
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

    const headings = useMemo(() => {
        const headings: string[] = [intl.formatMessage({ id: "gd.gen-ai.state.thinking" })];
        group.messages.forEach((m) => {
            switch (m.content.type) {
                case "reasoning": {
                    const last = m.content.summary ? extractHeading(m.content.summary) : undefined;
                    if (last && headings[headings.length - 1] !== last) {
                        headings.push(last);
                    }
                    break;
                }
                case "toolCall":
                case "toolResult":
                default:
                    break;
            }
        });
        return headings;
    }, [group.messages, intl]);

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
        headings,
        duration,
        isEmpty,
        isCompleted,
        isExpanded,
        setIsExpanded,
    };
}

//duration

export function formatDuration(intl: IntlShape, ms: number): string {
    const messages = defineMessages({
        seconds: { id: "gd.gen-ai.state.seconds" },
        minutes: { id: "gd.gen-ai.state.minutes" },
    });

    const seconds = Math.round((ms / 1000) * 100) / 100;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    if (remainingSeconds === 60) {
        return `${minutes + 1}${intl.formatMessage(messages.minutes)}`;
    }
    if (minutes === 0) {
        return `${Math.max(remainingSeconds, 1)}${intl.formatMessage(messages.seconds)}`;
    }
    if (remainingSeconds === 0) {
        return `${minutes}${intl.formatMessage(messages.minutes)}`;
    }
    return `${minutes}${intl.formatMessage(messages.minutes)} ${remainingSeconds}${intl.formatMessage(messages.seconds)}`;
}

//DEFAULT GROUP

interface IDefaultItemsGroupProps extends IItemsGroupProps {
    classNames: string;
}

function DefaultItemsGroup({ classNames, children }: IDefaultItemsGroupProps) {
    return <div className={classNames}>{children}</div>;
}
