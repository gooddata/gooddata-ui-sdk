// (C) 2007-2026 GoodData Corporation

import { useSelector } from "react-redux";

import type { IDataTooLargeResponseBodyLimitBreak } from "@gooddata/sdk-backend-spi";

import { getExecutionErrorResponseData } from "../../../selectors/report_selector.js";
import { ReportInvalidConfiguration } from "../ReportInvalidConfiguration.js";

import { ReportTooLargeToCalculate } from "./ReportTooLargeToCalculate.js";
import { ReportTooLargeToCrosstabulate } from "./ReportTooLargeToCrosstabulate.js";
import { isOnlyCalculationLimitBreaks, isOnlyCrosstabulationLimitBreaks } from "./types.js";

/**
 * Displays the information about how exactly the report violated some size limit.
 *
 * Delegates to specialized components to keep the logic collocated.
 */
export function ReportTooLargeToCompute() {
    const errorResponseData = useSelector(getExecutionErrorResponseData);

    const structuredDetail = errorResponseData?.rawData?.["structuredDetail"] as
        | { limitBreaks?: IDataTooLargeResponseBodyLimitBreak[] }
        | undefined;
    const limitBreaks: IDataTooLargeResponseBodyLimitBreak[] = structuredDetail?.limitBreaks ?? [];

    if (!limitBreaks.length) {
        // it should not happen that there is no structured information about why the report is too large,
        // but if it does, fall back to the generic message instead of failing
        return <ReportInvalidConfiguration />;
    } else if (isOnlyCalculationLimitBreaks(limitBreaks)) {
        return <ReportTooLargeToCalculate limitBreaks={limitBreaks} />;
    } else if (isOnlyCrosstabulationLimitBreaks(limitBreaks)) {
        return <ReportTooLargeToCrosstabulate limitBreaks={limitBreaks} />;
    } else {
        // this should never happen, but if it does, fall back to the generic message instead of failing
        return <ReportInvalidConfiguration />;
    }
}
