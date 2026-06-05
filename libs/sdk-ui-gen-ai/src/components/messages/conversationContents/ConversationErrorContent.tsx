// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useMemo, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { type ISettings } from "@gooddata/sdk-model";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { type IChatConversationErrorContent } from "../../../model.js";
import { settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { type RootState } from "../../../store/types.js";
import { useSettingsClick } from "../../hooks/useSettingsClick.js";
import { MarkdownComponent } from "../contents/Markdown.js";

export type ConversationErrorContentProps = {
    message: string;
    traceId?: string;
    code?: number;
    reason?: IChatConversationErrorContent["reason"];
    useMarkdown?: boolean;
    className?: string;
    isLoading?: boolean;
    settings?: ISettings;
};

function ConversationErrorContentCore({
    code,
    traceId,
    message,
    useMarkdown = false,
    settings,
    className,
    reason,
}: ConversationErrorContentProps) {
    const [showMore, setShowMore] = useState(false);
    const { formatMessage } = useIntl();

    const onSettings = useSettingsClick(settings);

    const components = useMemo(
        () => ({
            b: (parts: ReactNode) => <strong>{parts}</strong>,
        }),
        [],
    );

    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--error",
        className,
    );

    return (
        <div className={classNames}>
            <div className={cx("gd-gen-ai-chat__error-info")}>
                <div className={cx("gd-gen-ai-chat__content")}>
                    <p>
                        {reason === "METADATA_SYNC_IN_PROGRESS" ? (
                            <FormattedMessage
                                id="gd.gen-ai.global-error.sync-in-progress"
                                values={components}
                            />
                        ) : reason === "METADATA_SYNC_REQUEST_ERROR" ? (
                            <FormattedMessage id="gd.gen-ai.global-error.sync-failed" values={components} />
                        ) : reason === "MODEL_NOT_COMPATIBLE" ? (
                            <FormattedMessage
                                id="gd.gen-ai.global-model-not-compatible"
                                values={components}
                            />
                        ) : (
                            <MarkdownComponent allowMarkdown={useMarkdown}>{message}</MarkdownComponent>
                        )}
                        <span className={cx("gd-gen-ai-chat__show-more")}>
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
                        </span>
                    </p>
                </div>
            </div>
            {showMore ? (
                <div className={cx("gd-gen-ai-chat__error-details")}>
                    {reason === "MODEL_NOT_COMPATIBLE" ? (
                        <ModelNotCompatibleDetail onSettings={onSettings} />
                    ) : (
                        <ErrorDetail message={message} traceId={traceId} code={code} />
                    )}
                </div>
            ) : null}
        </div>
    );
}

interface IModelNotCompatibleDetailProps {
    onSettings: ReturnType<typeof useSettingsClick>;
}

function ModelNotCompatibleDetail({ onSettings }: IModelNotCompatibleDetailProps) {
    const { formatMessage } = useIntl();

    return (
        <>
            <FormattedMessage
                tagName="p"
                id="gd.gen-ai.global-model-not-compatible.detail"
                values={{
                    b: (parts) => <strong>{parts}</strong>,
                }}
            />
            <UiButton
                size="medium"
                variant="tertiary"
                label={formatMessage({
                    id: "gd.gen-ai.global-model-not-compatible.button-open-settings",
                })}
                onClick={onSettings("change-model")}
            />
        </>
    );
}

interface IErrorDetailProps {
    message: string;
    traceId?: string;
    code?: number;
}

function ErrorDetail({ traceId, code, message }: IErrorDetailProps) {
    const { formatMessage } = useIntl();

    return (
        <>
            {traceId ? (
                <p className="gd-gen-ai-chat__conversation__item__content--error__trace-id">
                    <strong>{formatMessage({ id: "gd.gen-ai.global-error.traceId" })}:</strong> {traceId}
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
        </>
    );
}

const mapStateToProps = (state: RootState): Pick<ConversationErrorContentProps, "settings"> => {
    const settings = settingsSelector(state);
    return {
        settings,
    };
};

export const ConversationErrorContent = connect(mapStateToProps, null)(ConversationErrorContentCore);
