// (C) 2020 GoodData Corporation

/**
 * @public
 */
export type MessageType = "success" | "progress" | "error" | "warning";

/**
 * @public
 */
export interface IMessage {
    id: string;
    component?: React.Component;
    showMore?: string;
    showLess?: string;
    errorDetail?: string;
    contrast?: boolean;
    intensive?: boolean;
    text: string;
    type: MessageType;
}

/**
 * @public
 */
export interface IMessageProps {
    className?: string;
    onClose?(e: React.MouseEvent): void;
    type: MessageType;
    contrast?: boolean;
    intensive?: boolean;
}

/**
 * @public
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
