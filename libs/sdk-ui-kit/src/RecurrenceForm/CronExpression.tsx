// (C) 2024-2025 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { IAccessibilityConfigBase } from "src/typings/accessibility.js";
import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";

interface ICronExpressionProps {
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

export const CronExpression: React.FC<ICronExpressionProps> = ({
    expression,
    onChange,
    onBlur,
    showTimezone,
    timezone,
    disabled,
    validationError,
    accessibilityConfig,
}) => {
    const intl = useIntl();

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const value = e.target.value;
            onBlur(value);
        },
        [onBlur],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            onChange(value);
        },
        [onChange],
    );

    const cronPlaceholder = "* * * * * *";

    return (
        <>
            <div
                className={cx("gd-recurrence-form-cron s-recurrence-form-cron", {
                    "has-error": !!validationError,
                    "is-disabled": disabled,
                })}
            >
                <input
                    className="gd-input-field"
                    type="text"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={expression}
                    placeholder={cronPlaceholder}
                    disabled={disabled}
                    aria-describedby={accessibilityConfig?.ariaDescribedBy}
                    aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                />
            </div>
            {Boolean(showTimezone && timezone) && (
                <div className="gd-recurrence-form-repeat-type-description s-recurrence-form-repeat-type-description">
                    <FormattedMessage id="gs.date.at" tagName="span" />
                    <BubbleHoverTrigger
                        showDelay={0}
                        hideDelay={0}
                        className="gd-recurrence-form-timezone-wrapper"
                    >
                        <span className="gd-recurrence-form-timezone">
                            {" "}
                            {timezone} {intl.formatMessage({ id: "gs.time" })}
                        </span>
                        <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                            {timezone} {intl.formatMessage({ id: "gs.time" })}
                        </Bubble>
                    </BubbleHoverTrigger>
                </div>
            )}
        </>
    );
};
