// (C) 2024-2026 GoodData Corporation

import cx from "classnames";

import { type IChatKdaDefinition } from "@gooddata/sdk-backend-spi";

export type ConversationKdaContentProps = {
    kda: IChatKdaDefinition;
    className?: string;
};

export function ConversationKdaContent({ className }: ConversationKdaContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--kda",
        className,
    );

    //TODO: s.hacker Kda component here
    return (
        <div className={classNames}>
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
                    There is KDA
                </div>
            </div>
        </div>
    );
}
