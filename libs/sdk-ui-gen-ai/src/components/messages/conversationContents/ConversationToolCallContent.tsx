// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

export type ConversationToolCallContentProps = {
    name: string;
    arguments: object;
    className?: string;
    isLoading?: boolean;
};

export function ConversationToolCallContent({
    name,
    className,
    isLoading,
}: ConversationToolCallContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        `gd-gen-ai-chat__conversation__item__content--toolCall`,
        className,
    );

    return (
        <div className={classNames} data-testid="gen-ai-tool-call" data-tool-name={name}>
            <div>
                {isLoading ? (
                    <FormattedMessage
                        id="gd.gen-ai.message.reasoning.tool-call"
                        values={{
                            name: <code>{name}</code>,
                            b: (parts) => <strong>{parts}</strong>,
                        }}
                    />
                ) : (
                    <FormattedMessage
                        id="gd.gen-ai.message.reasoned.tool-call"
                        values={{
                            name: <code>{name}</code>,
                            b: (parts) => <strong>{parts}</strong>,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
