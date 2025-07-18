// (C) 2020-2025 GoodData Corporation

import { ComponentType, MouseEvent, ReactNode } from "react";
import { IntlShape } from "react-intl";

/**
 * @internal
 */
export type MessageType = "success" | "progress" | "error" | "warning";

/**
 * @internal
 */
export type FormatMessageParams = Parameters<IntlShape["formatMessage"]>;

/**
 * @internal
 */
export interface IMessageDefinition {
    component?: ComponentType;
    showMore?: string;
    showLess?: string;
    errorDetail?: string;
    contrast?: boolean;
    intensive?: boolean;
    values?: FormatMessageParams[1];
    text?: string;
    node?: ReactNode;
    type: MessageType;
    /**
     * After how long to automatically remove the message. If set to 0, message is shown until removed manually.
     * Defaults to 2500 ms.
     */
    duration?: number;
}

/**
 * @internal
 */
export interface IMessage extends IMessageDefinition {
    id: string;
}

/**
 * @internal
 */
export interface IMessageProps {
    className?: string;
    onClose?(e: MouseEvent): void;
    type: MessageType;
    contrast?: boolean;
    intensive?: boolean;
    children?: ReactNode;
}

/**
 * @internal
 */
export interface IMessagesProps {
    messages: Array<IMessage>;
    onMessageClose?(id: string): void;
}

/**
 * @internal
 */
export interface IMessagesState {
    shouldShowMore: boolean;
}
