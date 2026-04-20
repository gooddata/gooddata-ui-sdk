// (C) 2024-2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import { MarkdownComponent } from "../contents/Markdown.js";

export type ConversationErrorContentProps = {
    message: string;
    traceId?: string;
    code?: number;
    useMarkdown?: boolean;
    className?: string;
    isLoading?: boolean;
};

export function ConversationErrorContent({
    code,
    traceId,
    message,
    useMarkdown = false,
    className,
}: ConversationErrorContentProps) {
    const [showMore, setShowMore] = useState(false);
    const { formatMessage } = useIntl();

    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--error",
        className,
    );

    return (
        <div className={classNames}>
            <div className={cx("gd-gen-ai-chat__error-info")}>
                <div className={cx("gd-gen-ai-chat__content")}>
                    <MarkdownComponent allowMarkdown={useMarkdown}>{message}</MarkdownComponent>
                </div>
                <div className={cx("gd-gen-ai-chat__show-more")}>
                    <UiButton
                        size="small"
                        variant="tertiary"
                        onClick={() => setShowMore(!showMore)}
                        label={
                            showMore
                                ? formatMessage({ id: "gd.gen-ai.global-error.show-less" })
                                : formatMessage({ id: "gd.gen-ai.global-error.show-more" })
                        }
                    />
                </div>
            </div>
            {showMore ? (
                <div className={cx("gd-gen-ai-chat__error-details")}>
                    {traceId ? (
                        <p className="gd-gen-ai-chat__conversation__item__content--error__trace-id">
                            <strong>{formatMessage({ id: "gd.gen-ai.global-error.traceId" })}:</strong>{" "}
                            {traceId}
                        </p>
                    ) : null}
                    <p>
                        <pre>
                            {JSON.stringify(
                                {
                                    message: message,
                                    ...(code === null ? {} : { status: code }),
                                },
                                null,
                                2,
                            )}
                        </pre>
                    </p>
                </div>
            ) : null}
        </div>
    );
}
