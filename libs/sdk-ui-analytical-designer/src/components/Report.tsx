// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import classNames from "classnames";
import { useSelector } from "react-redux";

import { reportSelector } from "../selectors/report_selector.js";
import { type IExtendedRefPointCustomError } from "../store/reference_point/extended_reference_point_state.js";
import { type IMissingDateFilterItem } from "../typings/report.js";

import { ReportBlank } from "./report/ReportBlank.js";
import { ReportComputing } from "./report/ReportComputing.js";
import { ReportCustomError } from "./report/ReportCustomError.js";
import { ReportEmpty } from "./report/ReportEmpty.js";
import { ReportExecuteProtected } from "./report/ReportExecuteProtected.js";
import { ReportHasNegativeValues } from "./report/ReportHasNegativeValues.js";
import { ReportInvalidConfiguration } from "./report/ReportInvalidConfiguration.js";
import { ReportMissingArea } from "./report/ReportMissingArea.js";
import { ReportMissingColumns } from "./report/ReportMissingColumns.js";
import { ReportMissingLocation } from "./report/ReportMissingLocation.js";
import { ReportMissingMetric } from "./report/ReportMissingMetric.js";
import { ReportNotFound } from "./report/ReportNotFound.js";
import { ReportTooLargeToCompute } from "./report/ReportTooLargeToCompute/ReportTooLargeToCompute.js";
import { ReportTooLargeToDisplay } from "./report/ReportTooLargeToDisplay.js";
import { ReportUnsupportedConfiguration } from "./report/ReportUnsupportedConfiguration.js";
import { ReportVisualization } from "./report/ReportVisualization.js";
import { WorkspaceEmpty } from "./report/WorkspaceEmpty.js";

export interface IReportProps {
    projectId: string;
    appSessionId: string;
    isExecutionRunning?: boolean;
    isReportNotFound?: boolean;
    reportNotFoundMissingItems?: ReadonlyArray<IMissingDateFilterItem>;
    isReportTooLargeToCompute?: boolean;
    isReportTooLargeToDisplay?: boolean;
    isInvalidConfiguration?: boolean;
    isReportWithFiltersEmpty?: boolean;
    isReportWithoutFiltersEmpty?: boolean;
    isBadRequest?: boolean;
    isReportProtected?: boolean;
    isMissingLocation?: boolean;
    isMissingArea?: boolean;
    isMissingMetric?: boolean;
    isMissingColumns?: boolean;
    isSmallScreen?: boolean;
    isExecutable?: boolean;
    isComputingShortcut?: boolean;
    isNoMetricSupported?: boolean;
    hasNegativeValue?: boolean;
    unsupportedConfiguration?: boolean;
    hasReportLoadingError?: boolean;
    customError?: IExtendedRefPointCustomError | null;
    messages?: Record<string, string>;
}

export const ReportBase = memo(function Report({
    projectId = null,
    appSessionId,
    messages = {},
    isSmallScreen = false,
    isExecutionRunning = false,
    isReportNotFound = false,
    reportNotFoundMissingItems,
    isReportTooLargeToCompute = false,
    isReportTooLargeToDisplay = false,
    isInvalidConfiguration = false,
    isReportWithFiltersEmpty = false,
    isReportWithoutFiltersEmpty = false,
    isBadRequest = false,
    isReportProtected = false,
    isMissingLocation = false,
    isMissingArea = false,
    isMissingMetric = false,
    isMissingColumns = false,
    isExecutable = false,
    isComputingShortcut = false,
    isNoMetricSupported,
    hasNegativeValue = false,
    unsupportedConfiguration = false,
    hasReportLoadingError = false,
    customError = null,
}: IReportProps) {
    const getReportErrorComponent = () => {
        if (hasReportLoadingError) {
            return ReportBlank; // we do not render specific error for now, only red toast message
        } else if (isReportNotFound) {
            return ReportNotFound;
        } else if (!isExecutable) {
            return ReportBlank;
        } else if (unsupportedConfiguration) {
            return ReportUnsupportedConfiguration;
        } else if (customError) {
            return ReportCustomError;
        } else if (isMissingArea) {
            return ReportMissingArea;
        } else if (isMissingLocation) {
            return ReportMissingLocation;
        } else if (isMissingMetric && !isNoMetricSupported) {
            return ReportMissingMetric;
        } else if (isMissingColumns) {
            return ReportMissingColumns;
        } else if (hasNegativeValue) {
            return ReportHasNegativeValues;
        } else if (isInvalidConfiguration || isBadRequest) {
            return ReportInvalidConfiguration;
        } else if (isReportTooLargeToCompute) {
            return ReportTooLargeToCompute;
        } else if (isReportTooLargeToDisplay) {
            return ReportTooLargeToDisplay;
        } else if (isExecutionRunning || isComputingShortcut) {
            return ReportComputing;
        } else if (isReportWithFiltersEmpty) {
            return ReportEmpty;
        } else if (isReportWithoutFiltersEmpty) {
            return WorkspaceEmpty;
        } else if (isReportProtected) {
            return ReportExecuteProtected;
        }
        return null;
    };

    const ErrorComponent = getReportErrorComponent();
    const className = classNames({
        "invisible-report-visualization": ErrorComponent !== null,
    });
    return (
        <div className={className}>
            {ErrorComponent === ReportNotFound ? (
                <ReportNotFound missingItems={reportNotFoundMissingItems} />
            ) : ErrorComponent === null ? null : (
                <ErrorComponent isSmallScreen={isSmallScreen} />
            )}
            <ReportVisualization
                key={appSessionId}
                projectId={projectId}
                appSessionId={appSessionId}
                messages={messages}
            />
        </div>
    );
});

export function Report({ isSmallScreen }: { isSmallScreen: boolean }) {
    const reportProps = useSelector(reportSelector);

    return <ReportBase {...reportProps} isSmallScreen={isSmallScreen} />;
}
