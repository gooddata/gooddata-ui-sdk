// (C) 2025-2026 GoodData Corporation

import { useCallback, useState } from "react";

import prettyBytes from "pretty-bytes";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IDataTooLargeResponseBodyLimitBreak } from "@gooddata/sdk-backend-spi";
import { Button } from "@gooddata/sdk-ui-kit";

import { type IShowAddMessagePayload, addMessage } from "../../../actions/messages_actions.js";
import { canManageProject as canManageProjectSelector } from "../../../selectors/permissions_selector.js";
import { getExecutionErrorResponseData } from "../../../selectors/report_selector.js";
import { type AppDispatch } from "../../../store/types.js";
import { ErrorRawDataArea } from "../ErrorRawDataArea.js";
import { ReportMessage } from "../ReportMessage.js";
import { TraceIdMessage } from "../TraceIdMessage.js";

import { type CalculationLimitType } from "./types.js";

/**
 * Mapping type that ensures that there is a value for each existing limit type in compile time.
 */
type LimitBreakMapping<TValue> = { [T in CalculationLimitType]: TValue };

/**
 * Maps the limit break type coming from the backend to intl message id for the description.
 */
const limitBreakTypeDescriptionLocalizationMessages: LimitBreakMapping<string> = {
    "sql-cumulative-table-bytes": defineMessage({
        id: "dashboard.message.too_large_to_calculate.cumulative_table_bytes.description",
    }).id,
};

/**
 * Maps the limit break type coming from the backend to intl message id for the call to action.
 */
const limitBreakTypeCallToActionLocalizationMessages: LimitBreakMapping<string> = {
    "sql-cumulative-table-bytes": defineMessage({
        id: "dashboard.message.too_large_to_calculate.cumulative_table_bytes.call_to_action",
    }).id,
};

/**
 * Format the raw bytes to a human-readable format in the given locale (important mainly
 * for decimal point vs. decimal comma).
 */
function formatBytes(bytes: number, locale: string): string {
    return prettyBytes(bytes, { locale });
}

interface IReportTooLargeToCalculateProps {
    limitBreaks: IDataTooLargeResponseBodyLimitBreak<CalculationLimitType>[];
}

/**
 * Displays the information about how exactly the report violated a SQL computation size limit.
 */
export function ReportTooLargeToCalculate({ limitBreaks }: IReportTooLargeToCalculateProps) {
    const intl = useIntl();

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
    const showErrorRawDataArea = useCallback(() => setShowErrorRawData(true), [setShowErrorRawData]);

    // currently there can only be exactly one limit break,
    // and the caller guarantees that the limitBreaks array is not empty
    const limitBreak = limitBreaks[0];

    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.too_large_to_calculate.header" }).id}
            className="s-error-too-large s-report-message-type-too_large_to_compute"
        >
            <FormattedMessage
                id={limitBreakTypeDescriptionLocalizationMessages[limitBreak.limitType]}
                values={{
                    limit: formatBytes(limitBreak.limit, intl.locale),
                }}
            />
            <br />
            <FormattedMessage id={limitBreakTypeCallToActionLocalizationMessages[limitBreak.limitType]} />
            {canManageProject && !shouldShowErrorRawData ? (
                <>
                    <br />
                    <Button
                        value={intl.formatMessage(
                            defineMessage({ id: "dashboard.message.too_large_to_compute.see_raw_error" }),
                        )}
                        className="gd-button-link adi-canvas-link s-error-raw-data-link"
                        onClick={showErrorRawDataArea}
                        tagName="a"
                    />
                </>
            ) : null}
            {shouldShowErrorRawData ? <ErrorRawDataArea errorRawData={errorResponseData?.rawData} /> : null}
            {errorResponseData?.traceId ? (
                <TraceIdMessage
                    traceId={errorResponseData.traceId}
                    canManageProject={canManageProject}
                    showToastMessage={showToastMessage}
                />
            ) : null}
        </ReportMessage>
    );
}
