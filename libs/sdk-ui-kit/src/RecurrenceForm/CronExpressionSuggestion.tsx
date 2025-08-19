// (C) 2025 GoodData Corporation

import React from "react";

import { FormattedMessage, defineMessage } from "react-intl";

import { RECURRENCE_TYPES } from "./constants.js";

const cronTooltipMessage = defineMessage({ id: "recurrence.cron.tooltip" });

interface ICronExpressionMessageProps {
    messageId?: string;
    isWhiteLabeled?: boolean;
}

interface ICronExpressionSuggestionProps {
    errorId: string;
    validationError: string | null;
    recurrenceType: string;
    isWhiteLabeled?: boolean;
}

const CronExpressionMessage: React.FC<ICronExpressionMessageProps> = ({ messageId, isWhiteLabeled }) => {
    return (
        <FormattedMessage
            id={messageId}
            values={{
                a: (chunk: React.ReactNode) => {
                    return !isWhiteLabeled ? (
                        <a
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-CronExpressions"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            {chunk}
                        </a>
                    ) : null;
                },
            }}
        />
    );
};

export const CronExpressionSuggestion: React.FC<ICronExpressionSuggestionProps> = ({
    errorId,
    validationError,
    recurrenceType,
    isWhiteLabeled,
}) => {
    if (recurrenceType !== RECURRENCE_TYPES.CRON) {
        return null;
    }

    return (
        <div className="gd-recurrence-form-hint-wrapper">
            {validationError ? (
                <span id={errorId} className="gd-recurrence-form-cron-error-message">
                    <CronExpressionMessage messageId={validationError} isWhiteLabeled={isWhiteLabeled} />
                </span>
            ) : (
                <span className="gd-recurrence-form-cron-help">
                    <CronExpressionMessage
                        messageId={cronTooltipMessage.id}
                        isWhiteLabeled={isWhiteLabeled}
                    />
                </span>
            )}
        </div>
    );
};
