// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { useIntl } from "react-intl";

import { ErrorComponent } from "@gooddata/sdk-ui";
import { Button, UiCopyButton, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

type GlobalErrorProps = {
    errorMessage?: string;
    errorDescription?: string;
    errorDetails?: string;
    errorTraceId?: string;
    clearing?: boolean;
    clearError?: () => void;
    buttonsBefore?: ReactNode;
};

export function GlobalError({
    errorMessage,
    errorDescription,
    errorDetails,
    errorTraceId,
    buttonsBefore,
    clearing,
    clearError,
}: GlobalErrorProps) {
    const intl = useIntl();

    const [showMore, setShowMore] = useState(false);
    const hasShowMoreButton = Boolean(errorDetails && !showMore);

    return (
        <div className="gd-gen-ai-chat__global_error">
            <div>
                <ErrorComponent
                    message={errorMessage ?? intl.formatMessage({ id: "gd.gen-ai.global-error" })}
                    description={
                        errorDescription ?? intl.formatMessage({ id: "gd.gen-ai.global-error.description" })
                    }
                />
            </div>
            <div className="gd-gen-ai-chat__global_error__buttons">
                {buttonsBefore || clearError ? (
                    <div className="gd-gen-ai-chat__global_error__buttons_first">
                        {buttonsBefore}
                        {clearError ? (
                            <Button
                                className="gd-button-link"
                                value={intl.formatMessage({ id: "gd.gen-ai.global-error.button-clear" })}
                                onClick={clearError}
                                disabled={clearing}
                            />
                        ) : null}
                    </div>
                ) : null}
                {hasShowMoreButton ? (
                    <Button
                        className="gd-button-link"
                        value={intl.formatMessage({ id: "gd.gen-ai.global-error.button-details" })}
                        onClick={() => setShowMore(true)}
                        disabled={clearing}
                    />
                ) : null}
            </div>
            {showMore ? (
                <div className="gd-gen-ai-chat__global_error__details__content">
                    <div className="gd-gen-ai-chat__global_error__details__content-title">
                        <div className="gd-gen-ai-chat__global_error__details__content-title-text">
                            {intl.formatMessage({ id: "gd.gen-ai.global-error.details.title" })}
                        </div>
                        <UiTooltip
                            triggerBy={["hover", "focus"]}
                            anchor={<UiIconButton icon="question" variant="tertiary" />}
                            content={intl.formatMessage({
                                id: "gd.gen-ai.global-error.details.title.tooltip",
                            })}
                        />
                    </div>
                    <div className="gd-gen-ai-chat__global_error__details__content-description">
                        {errorDetails}
                    </div>
                </div>
            ) : null}
            {errorTraceId ? (
                <div className="gd-gen-ai-chat__global_error__trace-id">
                    <div>
                        <span className="gd-gen-ai-chat__global_error__trace-id-name">
                            {intl.formatMessage({ id: "gd.gen-ai.global-error.traceId" })}:
                        </span>{" "}
                        {errorTraceId}
                    </div>
                    <UiCopyButton
                        label={intl.formatMessage({ id: "gd.gen-ai.global-error.traceId.copy" })}
                        clipboardContent={errorTraceId ?? ""}
                    />
                </div>
            ) : null}
        </div>
    );
}
