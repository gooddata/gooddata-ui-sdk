// (C) 2007-2021 GoodData Corporation
import React from "react";
import {
    GoodDataSdkError,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isNoDataSdkError,
    isProtectedReport,
} from "@gooddata/sdk-ui";

import { ExecuteProtectedError } from "./ExecuteProtectedError.js";
import { DataTooLargeError } from "./DataTooLargeError.js";
import { NoDataError } from "./NoDataError.js";
import { OtherError } from "./OtherError.js";
import { shouldRenderFullContent } from "./sizingUtils.js";

interface ICustomErrorProps {
    error: GoodDataSdkError;
    height?: number;
    width?: number;
    isCustomWidgetHeightEnabled?: boolean;
    forceFullContent?: boolean;
}

export const CustomError: React.FC<ICustomErrorProps> = ({
    error,
    height,
    width,
    isCustomWidgetHeightEnabled,
    forceFullContent,
}) => {
    const fullContent =
        forceFullContent || (isCustomWidgetHeightEnabled ? shouldRenderFullContent(height, width) : true);
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
};
