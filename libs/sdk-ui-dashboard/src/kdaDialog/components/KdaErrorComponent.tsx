// (C) 2026 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";

import {
    type AnalyticalBackendError,
    isAnalyticalBackendError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { UiButton, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { selectPermissions, useDashboardSelector } from "../../model/index.js";

export interface KdaErrorComponentProps {
    type: KdaErrorType;
    error?: Error | AnalyticalBackendError;
}

export enum KdaErrorType {
    Items = "items",
    Details = "details",
}

export function KdaErrorComponent({ error }: KdaErrorComponentProps) {
    const permissions = useDashboardSelector(selectPermissions);
    const detailShow = permissions.canManageProject ?? false;

    if (isUnexpectedResponseError(error)) {
        return (
            <div className="gd-kda-dialog-error">
                <GeneralError />
                <DetailsShow detailShow={detailShow} rawError={error.responseBody as object} />
                <TraceId traceId={error.traceId} />
            </div>
        );
    }
    if (isAnalyticalBackendError(error)) {
        return (
            <div className="gd-kda-dialog-error">
                <GeneralError />
                <DetailsShow detailShow={detailShow} />
            </div>
        );
    }
    return <GeneralError />;
}

function GeneralError() {
    const intl = useIntl();

    return (
        <ErrorComponent
            height="auto"
            message={intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.error.general.title" })}
            description={intl.formatMessage({
                id: "kdaDialog.dialog.keyDrives.error.general.description",
            })}
        />
    );
}

interface TraceIdProps {
    traceId?: string;
}

function TraceId({ traceId }: TraceIdProps) {
    const intl = useIntl();
    const onCopyTraceId = () => {
        void navigator.clipboard.writeText(traceId ?? "");
    };

    if (traceId) {
        return null;
    }

    return (
        <div className="gd-kda-dialog-error-trace-id">
            <div>
                <span className="gd-kda-dialog-error-trace-id-name">
                    {intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.error.traceId" })}:
                </span>{" "}
                {traceId}
            </div>
            <UiIconButton icon="copy" size="small" variant="tertiary" onClick={onCopyTraceId} />
        </div>
    );
}

interface TraceIdProps {
    detailShow?: boolean;
    rawError?: object;
}

function DetailsShow({ detailShow, rawError }: TraceIdProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);

    if (!detailShow || !rawError) {
        return null;
    }

    return (
        <div className="gd-kda-dialog-error-details-show">
            {open ? (
                <div className="gd-kda-dialog-error-details-show-content">
                    <div className="gd-kda-dialog-error-details-show-content-title">
                        <div className="gd-kda-dialog-error-details-show-content-title-text">
                            {intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.error.details.title" })}
                        </div>
                        <UiTooltip
                            triggerBy={["hover", "focus"]}
                            anchor={<UiIconButton icon="question" variant="tertiary" />}
                            content={intl.formatMessage({
                                id: "kdaDialog.dialog.keyDrives.error.details.title.tooltip",
                            })}
                        />
                    </div>
                    <div className="gd-kda-dialog-error-details-show-content-description">
                        {JSON.stringify(rawError)}
                    </div>
                </div>
            ) : (
                <UiButton
                    label="See the raw error response for details"
                    variant="popout"
                    size="medium"
                    onClick={() => {
                        setOpen(true);
                    }}
                />
            )}
        </div>
    );
}
