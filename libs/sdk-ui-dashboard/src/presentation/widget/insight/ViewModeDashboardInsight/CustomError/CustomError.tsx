// (C) 2007-2025 GoodData Corporation

import {
    GoodDataSdkError,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isNoDataSdkError,
    isProtectedReport,
} from "@gooddata/sdk-ui";

import { DataTooLargeError } from "./DataTooLargeError.js";
import { ExecuteProtectedError } from "./ExecuteProtectedError.js";
import { NoDataError } from "./NoDataError.js";
import { OtherError } from "./OtherError.js";
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
    } else if (error) {
        return <OtherError fullContent={fullContent} />;
    }

    return null;
}
