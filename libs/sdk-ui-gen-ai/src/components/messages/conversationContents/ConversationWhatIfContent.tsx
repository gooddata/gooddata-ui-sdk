// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import { type IChatWhatIfDefinition } from "@gooddata/sdk-backend-spi";

export type ConversationWhatIfContentProps = {
    whatIf: IChatWhatIfDefinition;
    className?: string;
};

export function ConversationWhatIfContent({ className }: ConversationWhatIfContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--whatIf",
        className,
    );

    //TODO: s.hacker What if component here
    return (
        <div className={classNames}>
            <div
                style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                There is whatIf
            </div>
        </div>
    );
}
