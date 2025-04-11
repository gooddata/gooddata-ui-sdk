// (C) 2025 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import { RECURRENCE_TYPES } from "./constants.js";

interface ICronExpressionSuggestionProps {
    id: string;
    validationError: string | null;
    recurrenceType: string;
}

// NESTOR

export const CronExpressionSuggestion: React.FC<ICronExpressionSuggestionProps> = ({
    id,
    validationError,
    recurrenceType,
}) => {
    if (recurrenceType !== RECURRENCE_TYPES.CRON) {
        return null;
    }

    return (
        <div className="gd-recurrence-form-hint-wrapper">
            {validationError ? (
                <span id={id} className="gd-recurrence-form-cron-error-message">
                    <FormattedMessage
                        id={validationError}
                        values={{
                            a: (chunk: React.ReactNode) => (
                                <a
                                    href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-CronExpressions"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {chunk}
                                </a>
                            ),
                        }}
                    />
                </span>
            ) : (
                <span id={id} className="gd-recurrence-form-cron-help">
                    <FormattedMessage
                        id="recurrence.cron.tooltip"
                        values={{
                            a: (chunk: React.ReactNode) => (
                                <a
                                    href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-CronExpressions"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {chunk}
                                </a>
                            ),
                        }}
                    />
                </span>
            )}
        </div>
    );
};
