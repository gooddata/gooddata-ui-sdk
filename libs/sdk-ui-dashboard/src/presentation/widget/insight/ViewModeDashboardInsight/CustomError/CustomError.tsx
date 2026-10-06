// (C) 2007-2026 GoodData Corporation

import { type IInsightWidget } from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isNoDataSdkError,
    isProtectedReport,
    isResultCacheMissingSdkError,
} from "@gooddata/sdk-ui";

import { useDashboardComponentsContext } from "../../../../dashboardContexts/DashboardComponentsContext.js";

import { DataTooLargeError } from "./DataTooLargeError.js";
import { NoDataError } from "./NoDataError.js";
import { OtherError } from "./OtherError.js";
import { ResultCacheMissingError } from "./ResultCacheMissingError.js";
import { shouldRenderFullContent } from "./sizingUtils.js";

interface ICustomErrorProps {
    error: GoodDataSdkError;
    widget: IInsightWidget;
    height?: number;
    width?: number;
    forceFullContent?: boolean;
}

export function CustomError({ error, widget, height, width, forceFullContent }: ICustomErrorProps) {
    const { RestrictedPlaceholderComponentProvider } = useDashboardComponentsContext();
    const fullContent = forceFullContent || shouldRenderFullContent(height, width);
    // The visualization is readable but its data is not; the design treats both as a restricted widget.
    if (isProtectedReport(error)) {
        const RestrictedContent = RestrictedPlaceholderComponentProvider(widget);
        return <RestrictedContent width={width} height={height} />;
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
