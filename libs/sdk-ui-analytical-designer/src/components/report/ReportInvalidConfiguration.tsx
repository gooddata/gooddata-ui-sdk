// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { FormattedMessage, defineMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { type IShowAddMessagePayload, addMessage } from "../../actions/messages_actions.js";
import { canManageProject as canManageProjectSelector } from "../../selectors/permissions_selector.js";
import { getExecutionErrorResponseData } from "../../selectors/report_selector.js";
import { type AppDispatch } from "../../store/types.js";

import { ErrorRawDataArea } from "./ErrorRawDataArea.js";
import { ReportMessage } from "./ReportMessage.js";
import { TraceIdMessage } from "./TraceIdMessage.js";

export function ReportInvalidConfiguration() {
    const errorResponseData = useSelector(getExecutionErrorResponseData);
    const canManageProject = useSelector(canManageProjectSelector);

    const dispatch = useDispatch<AppDispatch>();
    const showToastMessage = useCallback(
        (payload: IShowAddMessagePayload) => {
            dispatch(addMessage(payload));
        },
        [dispatch],
    );

    const [shouldShowErrorRawData, setShowErrorRawData] = useState(false);

    const showErrorRawDataArea = useCallback(() => {
        setShowErrorRawData(true);
    }, [setShowErrorRawData]);

    const description = useMemo(() => {
        if (!canManageProject) {
            return <FormattedMessage id="dashboard.message.invalid_configuration.description" />;
        }

        const httpStatus =
            errorResponseData?.httpStatus ?? (errorResponseData?.rawData?.["status"] as number | undefined);
        const messageId =
            !httpStatus || httpStatus >= 500
                ? defineMessage({ id: "dashboard.message.invalid_configuration.manage_user.error.500" }).id
                : defineMessage({ id: "dashboard.message.invalid_configuration.manage_user.error.400" }).id;

        return (
            <FormattedMessage
                id={messageId}
                values={{
                    br: <br />,
                    link: (chunk) =>
                        !shouldShowErrorRawData && (
                            <Button
                                value={chunk}
                                className="gd-button-link adi-canvas-link s-error-raw-data-link"
                                onClick={showErrorRawDataArea}
                                tagName="a"
                            />
                        ),
                }}
            />
        );
    }, [canManageProject, errorResponseData, shouldShowErrorRawData, showErrorRawDataArea]);

    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.invalid_configuration.header" }).id}
            className="adi-canvas-message-invalid-conf s-error-invalid-configuration s-report-message-type-invalid_configuration"
        >
            {description}
            {shouldShowErrorRawData ? <ErrorRawDataArea errorRawData={errorResponseData?.rawData} /> : null}
            {errorResponseData?.traceId ? (
                <TraceIdMessage
                    traceId={errorResponseData?.traceId}
                    canManageProject={canManageProject}
                    showToastMessage={showToastMessage}
                />
            ) : null}
        </ReportMessage>
    );
}
