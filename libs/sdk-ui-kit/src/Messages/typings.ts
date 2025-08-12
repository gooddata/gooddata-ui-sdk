// (C) 2020-2025 GoodData Corporation

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
    component?: React.ComponentType;
    showMore?: string;
    showLess?: string;
    errorDetail?: string;
    contrast?: boolean;
    intensive?: boolean;
    values?: FormatMessageParams[1];
    text?: string;
    node?: React.ReactNode;
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
    id?: string;
    className?: string;
    onClose?(e: React.MouseEvent): void;
    type: MessageType;
    contrast?: boolean;
    intensive?: boolean;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export interface IMessagesProps {
    messages: Array<IMessage>;
    onMessageClose?(id: string): void;
    /**
     * Whether to mark the container as a region for accessibility purposes.
     */
    regionEnabled?: boolean;
}

/**
 * @internal
 */
export interface IMessagesState {
    shouldShowMore: boolean;
}
