// (C) 2007-2025 GoodData Corporation

import {
    type GoodDataSdkError,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isNoDataSdkError,
    isProtectedReport,
    isResultCacheMissingSdkError,
} from "@gooddata/sdk-ui";

import { DataTooLargeError } from "./DataTooLargeError.js";
import { ExecuteProtectedError } from "./ExecuteProtectedError.js";
import { NoDataError } from "./NoDataError.js";
import { OtherError } from "./OtherError.js";
import { ResultCacheMissingError } from "./ResultCacheMissingError.js";
import { shouldRenderFullContent } from "./sizingUtils.js";

interface ICustomErrorProps {
    error: GoodDataSdkError;
    height?: number;
    width?: number;
    forceFullContent?: boolean;
}

export function CustomError({ error, height, width, forceFullContent }: ICustomErrorProps) {
    const fullContent = forceFullContent || shouldRenderFullContent(height, width);
    if (isProtectedReport(error)) {
        return <ExecuteProtectedError fullContent={fullContent} />;
    } else if (isDataTooLargeToDisplay(error) || isDataTooLargeToCompute(error)) {
        return <DataTooLargeError fullContent={fullContent} />;
    } else if (isNoDataSdkError(error)) {
        return <NoDataError fullContent={fullContent} />;
    } else if (isResultCacheMissingSdkError(error)) {
        return <ResultCacheMissingError fullContent={fullContent} />;
    } else if (error) {
        return <OtherError fullContent={fullContent} />;
    }

    return null;
}
