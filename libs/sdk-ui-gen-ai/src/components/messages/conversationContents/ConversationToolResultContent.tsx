// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, defineMessages } from "react-intl";

export type ConversationToolResultContentProps = {
    result: string;
    className?: string;
    isLoading?: boolean;
};

const messages = defineMessages({
    toolResultDone: {
        id: "gd.gen-ai.message.reasoned.tool-result",
    },
    toolResultLoading: {
        id: "gd.gen-ai.message.reasoning.tool-result",
    },
});

export function ConversationToolResultContent({ className, isLoading }: ConversationToolResultContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--tool-result",
        className,
    );

    return (
        <div className={classNames}>
            <div>
                <FormattedMessage
                    id={isLoading ? messages.toolResultLoading.id : messages.toolResultDone.id}
                    values={{
                        b: (parts) => <strong>{parts}</strong>,
                    }}
                />
            </div>
        </div>
    );
}
