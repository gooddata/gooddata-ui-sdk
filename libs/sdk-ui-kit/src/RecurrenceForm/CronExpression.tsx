// (C) 2024-2025 GoodData Corporation

import React, { useEffect, useState } from "react";
import { defineMessage, FormattedMessage } from "react-intl";
import cx from "classnames";
import { isCronExpressionValid } from "./utils.js";

const errorMessage = defineMessage({ id: "recurrence.error.too_often" });

interface ICronExpressionProps {
    id: string;
    expression: string;
    onChange: (expression: string, isValid: boolean) => void;
    allowHourlyRecurrence?: boolean;
    timezone?: string;
    showTimezone?: boolean;
}

export const CronExpression: React.FC<ICronExpressionProps> = (props) => {
    const { id, expression, onChange, allowHourlyRecurrence, showTimezone, timezone } = props;
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateExpression = (expression: string) => {
        const isValid = isCronExpressionValid(expression, allowHourlyRecurrence);

        if (isValid) {
            setValidationError(null);
        } else {
            setValidationError(errorMessage.id);
        }

        return isValid;
    };

    useEffect(() => {
        validateExpression(expression);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const isValid = validateExpression(value);
        onChange(value, isValid);
    };

    return (
        <>
            <div
                className={cx("gd-recurrence-form-cron s-recurrence-form-cron", {
                    "has-error": !!validationError,
                })}
            >
                <input id={id} className="gd-input-field" onChange={handleChange} value={expression} />
                {validationError ? (
                    <span className="gd-recurrence-form-cron-error-message">
                        <FormattedMessage id={validationError} />
                    </span>
                ) : (
                    <span className="gd-recurrence-form-cron-help">
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
            {Boolean(showTimezone && timezone) && (
                <div className="gd-recurrence-form-repeat-type-description s-recurrence-form-repeat-type-description">
                    <FormattedMessage id="gs.date.at" tagName="span" />
                    <span> {timezone}</span>
                </div>
            )}
        </>
    );
};
