// (C) 2024-2025 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IAccessibilityConfigBase } from "src/typings/accessibility.js";

interface ICronExpressionProps {
    id: string;
    expression: string;
    onChange: (expression: string) => void;
    onBlur: (expression: string) => void;
    allowHourlyRecurrence?: boolean;
    timezone?: string;
    showTimezone?: boolean;
    disabled?: boolean;
    validationError?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
}

export const CronExpression: React.FC<ICronExpressionProps> = (props) => {
    const {
        id,
        expression,
        onChange,
        onBlur,
        showTimezone,
        timezone,
        disabled,
        validationError,
        accessibilityConfig,
    } = props;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onBlur(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onChange(value);
    };
    return (
        <>
            <div
                className={cx("gd-recurrence-form-cron s-recurrence-form-cron", {
                    "has-error": !!validationError,
                })}
            >
                <input
                    id={id}
                    className="gd-input-field"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={expression}
                    placeholder="* * * * * *"
                    disabled={disabled}
                    aria-describedby={accessibilityConfig?.ariaDescribedBy}
                />
                {/* {!disabled && (
                    <>
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
                    </>
                )} */}
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
