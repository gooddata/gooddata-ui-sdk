// (C) 2020-2021 GoodData Corporation

/**
 * @internal
 */
export type MessageType = "success" | "progress" | "error" | "warning";

/**
 * @internal
 */
export interface IMessageDefinition {
    component?: React.Component;
    showMore?: string;
    showLess?: string;
    errorDetail?: string;
    contrast?: boolean;
    intensive?: boolean;
    text: string;
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
    onClose?(e: React.MouseEvent): void;
    type: MessageType;
    contrast?: boolean;
    intensive?: boolean;
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
