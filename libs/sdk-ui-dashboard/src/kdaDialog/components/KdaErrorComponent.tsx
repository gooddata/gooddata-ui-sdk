// (C) 2026 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";

import {
    type AnalyticalBackendError,
    isAnalyticalBackendError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { UiButton, UiCopyButton, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectPermissions } from "../../model/store/permissions/permissionsSelectors.js";

export interface IKdaErrorComponentProps {
    type: KdaErrorType;
    error?: Error | AnalyticalBackendError;
}

export enum KdaErrorType {
    Items = "items",
    Details = "details",
}

export function KdaErrorComponent({ error }: IKdaErrorComponentProps) {
    const permissions = useDashboardSelector(selectPermissions);
    const detailShow = permissions.canManageProject ?? false;

    if (isUnexpectedResponseError(error)) {
        const body = error.responseBody as any;
        return (
            <div className="gd-kda-dialog-error">
                <GeneralError />
                <DetailsShow detailShow={detailShow} rawError={body} />
                <TraceId traceId={error.traceId ?? body?.traceId} />
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

interface ITraceIdProps {
    traceId?: string;
}

function TraceId({ traceId }: ITraceIdProps) {
    const intl = useIntl();

    if (!traceId) {
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
            <UiCopyButton
                label={intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.error.traceId.copy" })}
                clipboardContent={traceId ?? ""}
            />
        </div>
    );
}

interface ITraceIdProps {
    detailShow?: boolean;
    rawError?: object;
}

function DetailsShow({ detailShow, rawError }: ITraceIdProps) {
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
